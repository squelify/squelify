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
  const payload = event.context.auth?.payload
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, VerifyOTPSchema)
    const now = Math.floor(Date.now() / 1000)

    const verification = await db
      .selectFrom('_sq_verifications')
      .where('token', '=', body.token)
      .where('type', '=', 'otp')
      .where('userId', '=', payload.sub)
      .where('verifiedAt', 'is', null)
      .where('expiresAt', '>', now)
      .select(['id', 'identifier', 'metadata', 'attempts', 'maxAttempts', 'expiresAt'])
      .executeTakeFirst()

    if (!verification) {
      await auditLog(event, {
        action: 'verify',
        entity: 'two_factor',
        entityId: body.token,
        metadata: {
          success: false,
          reason: 'invalid_token',
          userId: payload.sub,
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Token verifikasi tidak valid atau sudah kadaluarsa', 400)
    }

    if (verification.attempts >= verification.maxAttempts) {
      await auditLog(event, {
        action: 'verify',
        entity: 'two_factor',
        entityId: verification.id,
        metadata: {
          success: false,
          reason: 'max_attempts_exceeded',
          userId: payload.sub,
        },
        retention: 'CRITICAL',
      })

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
      const parsedMetadata = JSON.parse(JSON.stringify(verification.metadata))
      if (!parsedMetadata.code || !parsedMetadata.type || !parsedMetadata.purpose) {
        throw new Error('Invalid metadata structure')
      }
      metadata = parsedMetadata
    } catch {
      await auditLog(event, {
        action: 'verify',
        entity: 'two_factor',
        entityId: verification.id,
        metadata: {
          success: false,
          reason: 'invalid_metadata',
          userId: payload.sub,
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Format metadata tidak valid', 400)
    }

    if (metadata.code !== body.code) {
      await db
        .updateTable('_sq_verifications')
        .set({
          attempts: verification.attempts + 1,
          updatedAt: now,
        })
        .where('id', '=', verification.id)
        .execute()

      await auditLog(event, {
        action: 'verify',
        entity: 'two_factor',
        entityId: verification.id,
        metadata: {
          success: false,
          reason: 'invalid_code',
          userId: payload.sub,
          remainingAttempts: verification.maxAttempts - (verification.attempts + 1),
        },
        retention: 'CRITICAL',
      })

      const remainingAttempts = verification.maxAttempts - (verification.attempts + 1)
      return createErrorResponse(
        event,
        `Kode OTP tidak valid. Sisa percobaan: ${remainingAttempts}`,
        400
      )
    }

    await db
      .updateTable('_sq_verifications')
      .set({
        verifiedAt: now,
        updatedAt: now,
      })
      .where('id', '=', verification.id)
      .execute()

    await auditLog(event, {
      action: 'verify',
      entity: 'two_factor',
      entityId: verification.id,
      metadata: {
        success: true,
        userId: payload.sub,
        type: metadata.type,
        purpose: metadata.purpose,
      },
      retention: 'CRITICAL',
    })

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
