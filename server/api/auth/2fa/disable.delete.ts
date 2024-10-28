import * as jose from 'jose'
import { z } from 'zod'

const DisableTOTPSchema = z
  .object({
    id: z.string({ required_error: 'ID authenticator diperlukan' }),
    code: z.string().length(6, 'Kode TOTP harus 6 karakter'),
  })
  .strict()

export default defineEventHandler(async (event) => {
  try {
    const db = event.context.db
    const token = getRequestHeader(event, 'Authorization')?.replace('Bearer ', '')

    if (!token) {
      return createErrorResponse(401, 'Unauthorized')
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

    const body = await readValidatedBody(event, (body) => DisableTOTPSchema.safeParse(body))
    if (!body.success) {
      return createErrorResponse(400, 'Invalid request', {
        issues: body.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    // Get TOTP record with complete status check
    const twoFactor = await db
      .selectFrom('two_factors')
      .where('id', '=', body.data.id)
      .where('userId', '=', payload.sub)
      .where('type', '=', 'totp')
      .select(['id', 'name', 'secret', 'isPrimary', 'isVerified', 'lastUsedAt'])
      .executeTakeFirst()

    if (!twoFactor) {
      return createErrorResponse(404, 'Authenticator tidak ditemukan')
    }

    if (!twoFactor.isVerified) {
      return createErrorResponse(400, 'Authenticator belum diverifikasi')
    }

    // Verify TOTP code first
    const isValid = verifyTOTP(twoFactor.secret, body.data.code)
    if (!isValid) {
      return createErrorResponse(400, 'Kode TOTP tidak valid')
    }

    // Check if this is the last verified 2FA
    if (twoFactor.isPrimary) {
      const otherVerified2FA = await db
        .selectFrom('two_factors')
        .where('userId', '=', payload.sub)
        .where('id', '!=', twoFactor.id)
        .where('isVerified', '=', 1)
        .select(['id', 'name'])
        .executeTakeFirst()

      if (!otherVerified2FA) {
        return createErrorResponse(
          400,
          'Tidak dapat menonaktifkan authenticator utama. Aktifkan authenticator lain terlebih dahulu.'
        )
      }

      // Set other 2FA as primary
      await db
        .updateTable('two_factors')
        .set({
          isPrimary: 1,
          updatedAt: now,
        })
        .where('id', '=', otherVerified2FA.id)
        .execute()
    }

    // Delete the TOTP record
    await db.deleteFrom('two_factors').where('id', '=', twoFactor.id).execute()

    return {
      status: 200,
      success: true,
      message: `Authenticator "${twoFactor.name}" berhasil dinonaktifkan`,
      data: {
        id: twoFactor.id,
        name: twoFactor.name,
        disabledAt: new Date(now * 1000).toISOString(),
      },
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
