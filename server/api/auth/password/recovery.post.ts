import { typeid } from 'typeid-js'
import { z } from 'zod'
import { AppConfig } from '~/config'
import { findUserByEmail } from '~/database/repository/user.repo'

const PasswordRecoverySchema = z.object({ email: z.string().email('Email tidak valid') }).strict()

export default defineEventHandler(async (event) => {
  try {
    const db = event.context.db
    const appConfig = useAppConfig(event) as AppConfig
    const body = await readValidatedBody(event, (body) => PasswordRecoverySchema.safeParse(body))

    if (!body.success) {
      return createErrorResponse(400, 'Invalid request', {
        issues: body.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    const now = Math.floor(Date.now() / 1000)

    // Find user by email
    const user = await findUserByEmail(body.data.email)

    if (!user) {
      return createErrorResponse(400, 'Email tidak terdaftar')
    }

    // Create verification token
    const token = typeid().toString()
    await db
      .insertInto('verifications')
      .values({
        id: typeid('ver').toString(),
        userId: user.id,
        type: 'password_reset',
        identifier: body.data.email,
        token,
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
