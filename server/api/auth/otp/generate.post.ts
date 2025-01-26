import { typeid } from 'typeid-js'
import { z } from 'zod'
import { generateRandomStr } from '~/utils/string'

interface OTPMetadata {
  code: string
  type: 'email' | 'sms'
  purpose: '2fa' | 'login' | 'recovery'
}

const GenerateOTPSchema = z
  .object({
    type: z.enum(['email', 'sms']),
    purpose: z.enum(['2fa', 'login', 'recovery']),
  })
  .strict()

export default defineEventHandler(async (event) => {
  const payload = event.context.auth?.payload
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, GenerateOTPSchema)
    const now = Math.floor(Date.now() / 1000)

    const userEmail = await db
      .selectFrom('_sq_emails')
      .where('userId', '=', payload.sub)
      .where('isPrimary', '=', 1)
      .where('verifiedAt', 'is not', null)
      .select(['email'])
      .executeTakeFirst()

    if (!userEmail) {
      await auditLog(event, {
        action: 'create',
        entity: 'two_factor',
        entityId: payload.sub,
        metadata: {
          success: false,
          reason: 'primary_email_not_found',
          type: body.type,
          purpose: body.purpose,
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Primary email not found or not verified', 404)
    }

    const otpCode = generateRandomStr({ size: 6, digitsOnly: true })
    const verificationToken = typeid().toString()

    const metadata: OTPMetadata = {
      code: otpCode,
      type: body.type,
      purpose: body.purpose,
    }

    await db
      .insertInto('_sq_verifications')
      .values({
        id: typeid('ver').toString(),
        userId: payload.sub,
        type: 'otp',
        identifier: userEmail.email,
        token: verificationToken,
        attempts: 0,
        maxAttempts: 3,
        metadata: JSON.stringify(metadata),
        expiresAt: now + DURATION.MINUTE * 5,
        createdAt: now,
      })
      .execute()

    logger.info('[auth]', `OTP Code: ${otpCode}`)

    await auditLog(event, {
      action: 'create',
      entity: 'two_factor',
      entityId: verificationToken,
      metadata: {
        success: true,
        userId: payload.sub,
        type: body.type,
        purpose: body.purpose,
        email: userEmail.email,
      },
      retention: 'CRITICAL',
    })

    return {
      status: 200,
      success: true,
      message: 'OTP code has been sent',
      data: {
        token: verificationToken,
        identifier: userEmail.email,
        expiresIn: DURATION.MINUTE * 5,
      },
    }
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
