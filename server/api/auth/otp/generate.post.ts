import * as jose from 'jose'
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

    const body = await readValidatedBody(event, (body) => GenerateOTPSchema.safeParse(body))
    if (!body.success) {
      return createErrorResponse(400, 'Invalid request', {
        issues: body.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    // Get user's primary email
    const userEmail = await db
      .selectFrom('emails')
      .where('userId', '=', payload.sub)
      .where('isPrimary', '=', 1)
      .where('isVerified', '=', 1)
      .select(['email'])
      .executeTakeFirst()

    if (!userEmail) {
      return createErrorResponse(404, 'Email utama tidak ditemukan atau belum terverifikasi')
    }

    // Generate OTP code
    const otpCode = generateRandomStr({ size: 6, digitsOnly: true })
    const verificationToken = typeid().toString()

    const metadata: OTPMetadata = {
      code: otpCode,
      type: body.data.type,
      purpose: body.data.purpose,
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
        expiresAt: now + 60 * 5, // 5 minutes
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
        expiresIn: 300, // 5 minutes in seconds
      },
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
