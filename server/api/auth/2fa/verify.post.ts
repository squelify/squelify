import * as jose from 'jose'
import { z } from 'zod'
import { verifyTOTP } from '~/utils/totp'

const VerifyTOTPSchema = z
  .object({
    id: z.string(),
    code: z.string().length(6, 'Kode TOTP harus 6 karakter'),
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

    const body = await readValidatedBody(event, (body) => VerifyTOTPSchema.safeParse(body))
    if (!body.success) {
      return createErrorResponse(400, 'Invalid request', {
        issues: body.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    // Get TOTP record
    const twoFactor = await db
      .selectFrom('two_factors')
      .where('id', '=', body.data.id)
      .where('userId', '=', payload.sub)
      .where('type', '=', 'totp')
      .select(['id', 'secret', 'isVerified'])
      .executeTakeFirst()

    if (!twoFactor) {
      return createErrorResponse(404, 'TOTP tidak ditemukan')
    }

    // Verify TOTP code
    const isValid = verifyTOTP(twoFactor.secret, body.data.code)
    if (!isValid) {
      return createErrorResponse(400, 'Kode TOTP tidak valid')
    }

    // Update TOTP status if not verified
    if (!twoFactor.isVerified) {
      await db
        .updateTable('two_factors')
        .set({
          isVerified: 1,
          verifiedAt: now,
          lastUsedAt: now,
          updatedAt: now,
        })
        .where('id', '=', twoFactor.id)
        .execute()
    } else {
      // Just update last used timestamp
      await db
        .updateTable('two_factors')
        .set({
          lastUsedAt: now,
          updatedAt: now,
        })
        .where('id', '=', twoFactor.id)
        .execute()
    }

    return {
      status: 200,
      success: true,
      message: 'Verifikasi TOTP berhasil',
      data: {
        verifiedAt: new Date(now * 1000).toISOString(),
      },
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
