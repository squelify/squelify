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
  const payload = event.context.auth.payload
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, GenerateOTPSchema)
    const now = Math.floor(Date.now() / 1000)

    // Get user's primary email
    const userEmail = await db
      .selectFrom('emails')
      .where('userId', '=', payload.sub)
      .where('isPrimary', '=', 1)
      .where('verifiedAt', 'is not', null)
      .select(['email'])
      .executeTakeFirst()

    if (!userEmail) {
      return createErrorResponse(event, 'Email utama tidak ditemukan atau belum terverifikasi', 404)
    }

    // Generate OTP code
    const otpCode = generateRandomStr({ size: 6, digitsOnly: true })
    const verificationToken = typeid().toString()

    const metadata: OTPMetadata = {
      code: otpCode,
      type: body.type,
      purpose: body.purpose,
    }

    // Create verification record
    await db
      .insertInto('verifications')
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

    // Log OTP for development
    logger.info('[auth]', `OTP Code: ${otpCode}`)

    return {
      status: 200,
      success: true,
      message: 'Kode OTP telah dikirim',
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
