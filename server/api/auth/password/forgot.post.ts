import { isProduction } from 'std-env'
import { typeid } from 'typeid-js'
import { z } from 'zod'
import { findUserByEmail } from '~/database/repository/user.repo'

export interface IForgotPasswordResponse {
  verification: {
    email: string
    expiresIn: number
    verificationUrl?: string // Only in development
  }
}

const PasswordRecoverySchema = z
  .object({
    email: z.string().email('Invalid email address'),
  })
  .strict()

export default defineEventHandler(async (event) => {
  const appConfig = event.context.appConfig
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, PasswordRecoverySchema)
    const now = Math.floor(Date.now() / 1000)

    // Find user by email
    const user = await findUserByEmail(body.email)

    if (!user) {
      return createErrorResponse(event, 'Email address not registered', 400)
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
        event,
        `Too many reset attempts. Please try again in ${waitTimeMinutes} minutes`,
        400
      )
    }

    // Create verification token
    const token = typeid().toString()
    const attempts = existingVerification ? existingVerification.attempts + 1 : 1
    const expiresIn = DURATION.MINUTE * 30

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
        expiresAt: now + expiresIn,
        createdAt: now,
      })
      .execute()

    // Generate verification URL
    const verificationUrl = `${appConfig.baseURL}/auth/password/reset?token=${token}`
    logger.info('[app]', 'Reset password URL: ', verificationUrl)

    await auditLog(event, {
      action: 'forgot',
      entity: 'password',
      entityId: user.id,
      metadata: {
        success: true,
        email: body.email,
      },
    })

    const response: IForgotPasswordResponse = {
      verification: {
        email: body.email,
        expiresIn,
      },
    }

    // Include verification URL in development
    if (!isProduction) {
      response.verification.verificationUrl = verificationUrl
    }

    return createSuccessResponse<IForgotPasswordResponse>(
      event,
      'Password reset link has been sent to your email',
      response
    )
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
