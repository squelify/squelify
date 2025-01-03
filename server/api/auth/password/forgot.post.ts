import { isProduction } from 'std-env'
import { typeid } from 'typeid-js'
import { z } from 'zod'
import userRepo from '~/database/repository/user.repo'

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
    const repo = userRepo(db)
    const now = Math.floor(Date.now() / 1000)
    const body = await requireValidatedBody(event, PasswordRecoverySchema)
    const user = await repo.findByEmail(body.email)

    if (!user) {
      await auditLog(event, {
        action: 'forgot',
        entity: 'password',
        entityId: 'anonymous',
        metadata: {
          success: false,
          reason: 'email_not_found',
          email: body.email,
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Email address not registered', 400)
    }

    const existingVerification = await db
      .selectFrom('sq_verifications')
      .where('userId', '=', user.id)
      .where('type', '=', 'password_reset')
      .where('identifier', '=', body.email)
      .where('createdAt', '>', now - 60 * 30)
      .select(['id', 'attempts', 'maxAttempts', 'createdAt'])
      .orderBy('createdAt', 'desc')
      .executeTakeFirst()

    if (existingVerification && existingVerification.attempts >= 3) {
      const waitTimeMinutes = Math.ceil((existingVerification.createdAt + 60 * 30 - now) / 60)
      await auditLog(event, {
        action: 'forgot',
        entity: 'password',
        entityId: user.id,
        metadata: {
          success: false,
          reason: 'too_many_attempts',
          email: body.email,
          waitTime: waitTimeMinutes,
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(
        event,
        `Too many reset attempts. Please try again in ${waitTimeMinutes} minutes`,
        400
      )
    }

    const token = typeid().toString()
    const attempts = existingVerification ? existingVerification.attempts + 1 : 1
    const expiresIn = DURATION.MINUTE * 30

    await db
      .insertInto('sq_verifications')
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
      retention: 'CRITICAL',
    })

    const response: IForgotPasswordResponse = {
      verification: {
        email: body.email,
        expiresIn,
      },
    }

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
