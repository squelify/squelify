import * as jose from 'jose'
import { z } from 'zod'

const RecoverySchema = z
  .object({
    id: z.string({ required_error: 'ID authenticator diperlukan' }),
    code: z.string().length(8, 'Kode backup harus 8 karakter'),
  })
  .strict()

export default defineEventHandler(async (event) => {
  try {
    const db = event.context.db
    const token = getRequestHeader(event, 'Authorization')?.replace('Bearer ', '')

    if (!token) {
      return createErrorResponse(401, 'Token tidak ditemukan')
    }

    // Extract key ID from token header
    const decoded = jose.decodeProtectedHeader(token)
    if (!decoded.kid) {
      return createErrorResponse(401, 'Invalid token format')
    }

    const now = Math.floor(Date.now() / 1000)

    // Get JWK used for signing
    const jwk = await db
      .selectFrom('jwks')
      .where('keyId', '=', decoded.kid)
      .where('isActive', '=', 1)
      .where('expiresAt', '>', now)
      .select(['keyId', 'publicKey', 'algorithm'])
      .executeTakeFirst()

    if (!jwk) {
      return createErrorResponse(401, 'Invalid token signature')
    }

    // Verify token and decode payload
    const payload = await verifyAccessToken(token, jwk)

    if (!payload) {
      return createErrorResponse(401, 'Token tidak valid')
    }

    // Check if session is still valid
    const session = await db
      .selectFrom('sessions')
      .where('id', '=', payload.sid)
      .where('userId', '=', payload.sub)
      .where('isActive', '=', 1)
      .where('expiresAt', '>', now)
      .select(['id'])
      .executeTakeFirst()

    if (!session) {
      return createErrorResponse(401, 'Session tidak valid atau telah berakhir')
    }

    const body = await readValidatedBody(event, (body) => RecoverySchema.safeParse(body))
    if (!body.success) {
      return createErrorResponse(400, 'Invalid request', {
        issues: body.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    // Get 2FA record with complete status check
    const twoFactor = await db
      .selectFrom('two_factors')
      .where('id', '=', body.data.id)
      .where('userId', '=', payload.sub)
      .select(['id', 'name', 'type', 'isVerified', 'backupCodes', 'lastUsedAt'])
      .executeTakeFirst()

    if (!twoFactor) {
      return createErrorResponse(404, 'Authenticator tidak ditemukan')
    }

    if (!twoFactor.isVerified) {
      return createErrorResponse(400, 'Authenticator belum diverifikasi')
    }

    // Parse and verify backup codes
    let backupCodes: string[]

    try {
      backupCodes = JSON.parse(JSON.stringify(twoFactor.backupCodes))

      if (!Array.isArray(backupCodes)) {
        throw new Error('Invalid backup codes format')
      }
    } catch {
      return createErrorResponse(500, 'Format backup codes tidak valid')
    }

    if (backupCodes.length === 0) {
      return createErrorResponse(400, 'Tidak ada kode backup yang tersedia')
    }

    const codeIndex = backupCodes.indexOf(body.data.code)
    if (codeIndex === -1) {
      return createErrorResponse(400, 'Kode backup tidak valid atau sudah digunakan')
    }

    // Remove used backup code
    backupCodes.splice(codeIndex, 1)

    // Update backup codes and usage info
    await db
      .updateTable('two_factors')
      .set({
        backupCodes: JSON.stringify(backupCodes),
        lastUsedAt: now,
        updatedAt: now,
      })
      .where('id', '=', twoFactor.id)
      .execute()

    return {
      status: 200,
      success: true,
      message: `Recovery berhasil untuk authenticator '${twoFactor.name}'`,
      data: {
        id: twoFactor.id,
        name: twoFactor.name,
        type: twoFactor.type,
        remainingCodes: backupCodes.length,
        lastUsedAt: new Date(now * 1000).toISOString(),
        recoveredAt: new Date(now * 1000).toISOString(),
      },
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
