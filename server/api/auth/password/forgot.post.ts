import { typeid } from 'typeid-js'
import { z } from 'zod'
import { findUserByEmail } from '~/database/repository/user.repo'

const PasswordRecoverySchema = z.object({ email: z.string().email('Email tidak valid') }).strict()

export default defineEventHandler(async (event) => {
  const appConfig = event.context.appConfig
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, PasswordRecoverySchema)
    const now = Math.floor(Date.now() / 1000)

    // Find user by email
    const user = await findUserByEmail(body.email)

    if (!user) {
      return createErrorResponse(400, 'Email tidak terdaftar')
    }

    // Check existing verification attempts in last 30 minutes
    const existingVerification = await db
      .selectFrom('verifications')
      .where('userId', '=', user.id)
      .where('type', '=', 'password_reset')
      .where('identifier', '=', body.email)
      .where('createdAt', '>', now - 60 * 30)
      .select(['id', 'attempts', 'maxAttempts', 'createdAt'])
      .orderBy('createdAt', 'desc')
      .executeTakeFirst()

    // Max 3 attempts per 30 minutes
    if (existingVerification && existingVerification.attempts >= 3) {
      const waitTimeMinutes = Math.ceil((existingVerification.createdAt + 60 * 30 - now) / 60)
      return createErrorResponse(
        400,
        `Terlalu banyak permintaan reset password. Silakan coba lagi dalam ${waitTimeMinutes} menit.`
      )
    }

    // Create verification token
    const token = typeid().toString()
    const attempts = existingVerification ? existingVerification.attempts + 1 : 1

    await db
      .insertInto('verifications')
      .values({
        id: typeid('ver').toString(),
        userId: user.id,
        type: 'password_reset',
        identifier: body.email,
        token,
        attempts,
        maxAttempts: 3,
        expiresAt: now + 60 * 30, // 30 minutes
        createdAt: now,
      })
      .execute()

    // Send recovery email
    const verificationUrl = `${appConfig.baseURL}/auth/password/reset?token=${token}`
    logger.info('[app]', 'Reset password URL: ', verificationUrl)

    return {
      status: 200,
      success: true,
      message: 'Link reset password telah dikirim ke email Anda',
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
