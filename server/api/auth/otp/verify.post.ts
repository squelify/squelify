import * as jose from 'jose'
import { z } from 'zod'

interface OTPMetadata {
  code: string
  type: 'email' | 'sms'
  purpose: '2fa' | 'login' | 'recovery'
}

const VerifyOTPSchema = z
  .object({
    token: z.string({ required_error: 'Token verifikasi diperlukan' }),
    code: z.string().length(6, 'Kode OTP harus 6 karakter'),
  })
  .strict()

export default defineEventHandler(async (event) => {
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

  const body = await readValidatedBody(event, (body) => VerifyOTPSchema.safeParse(body))
  if (!body.success) {
    return createErrorResponse(400, 'Invalid request', {
      issues: body.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  // Get verification record with complete check
  const verification = await db
    .selectFrom('verifications')
    .where('token', '=', body.data.token)
    .where('type', '=', 'otp')
    .where('userId', '=', payload.sub)
    .where('verifiedAt', 'is', null)
    .where('expiresAt', '>', now)
    .select(['id', 'identifier', 'metadata', 'attempts', 'maxAttempts'])
    .executeTakeFirst()

  if (!verification) {
    return createErrorResponse(400, 'Token verifikasi tidak valid atau sudah kadaluarsa')
  }

  if (verification.attempts >= verification.maxAttempts) {
    return createErrorResponse(400, 'Melebihi batas maksimal percobaan')
  }

  let metadata: OTPMetadata

  try {
    // Parse metadata from JSON string
    const parsedMetadata = JSON.parse(JSON.stringify(verification.metadata))

    // Validate metadata structure
    if (!parsedMetadata.code || !parsedMetadata.type || !parsedMetadata.purpose) {
      throw new Error('Invalid metadata structure')
    }

    metadata = parsedMetadata
  } catch {
    return createErrorResponse(400, 'Format metadata tidak valid')
  }

  if (metadata.code !== body.data.code) {
    // Increment attempts
    await db
      .updateTable('verifications')
      .set({
        attempts: verification.attempts + 1,
        updatedAt: now,
      })
      .where('id', '=', verification.id)
      .execute()

    const remainingAttempts = verification.maxAttempts - (verification.attempts + 1)
    return createErrorResponse(400, `Kode OTP tidak valid. Sisa percobaan: ${remainingAttempts}`)
  }

  // Mark as verified
  await db
    .updateTable('verifications')
    .set({
      verifiedAt: now,
      updatedAt: now,
    })
    .where('id', '=', verification.id)
    .execute()

  return {
    status: 200,
    success: true,
    message: 'Verifikasi OTP berhasil',
    data: {
      type: metadata.type,
      purpose: metadata.purpose,
      identifier: verification.identifier,
      verifiedAt: new Date(now * 1000).toISOString(),
    },
  }
})
