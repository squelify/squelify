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
  const payload = event.context.auth.payload
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, VerifyOTPSchema)
    const now = Math.floor(Date.now() / 1000)

    // Get verification record with complete check
    const verification = await db
      .selectFrom('verifications')
      .where('token', '=', body.token)
      .where('type', '=', 'otp')
      .where('userId', '=', payload.sub)
      .where('verifiedAt', 'is', null)
      .where('expiresAt', '>', now)
      .select(['id', 'identifier', 'metadata', 'attempts', 'maxAttempts', 'expiresAt'])
      .executeTakeFirst()

    if (!verification) {
      return createErrorResponse(event, 'Token verifikasi tidak valid atau sudah kadaluarsa', 400)
    }

    if (verification.attempts >= verification.maxAttempts) {
      setResponseStatus(event, 400)
      const waitTimeMinutes = Math.ceil((verification.expiresAt - now) / 60)
      return createErrorResponse(
        event,
        `Melebihi batas maksimal percobaan. Silakan coba lagi dalam ${waitTimeMinutes} menit`,
        400
      )
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
      return createErrorResponse(event, 'Format metadata tidak valid', 400)
    }

    if (metadata.code !== body.code) {
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

      return createErrorResponse(
        event,
        `Kode OTP tidak valid. Sisa percobaan: ${remainingAttempts}`,
        400
      )
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
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
