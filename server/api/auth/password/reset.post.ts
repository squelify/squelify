import { z } from 'zod'
import { DEFAULT_PASSWORD_ALGORITHM } from '~/database/schemas/password'
import { hashPassword } from '~/utils/security'

export interface IResetPasswordResponse {
  password: {
    resetAt: string
  }
}

const PasswordResetSchema = z
  .object({
    token: z.string({ required_error: 'Reset token is required' }),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain uppercase letters')
      .regex(/[a-z]/, 'Password must contain lowercase letters')
      .regex(/[0-9]/, 'Password must contain numbers')
      .regex(/[^A-Za-z0-9]/, 'Password must contain special characters'),
  })
  .strict()

export default defineEventHandler(async (event) => {
  try {
    const db = event.context.db
    const body = await requireValidatedBody(event, PasswordResetSchema)
    const now = Math.floor(Date.now() / 1000)

    const verification = await db
      .selectFrom('_sq_verifications')
      .where('token', '=', body.token)
      .where('type', '=', 'password_reset')
      .where('verifiedAt', 'is', null)
      .where('expiresAt', '>', now)
      .select(['id', 'userId', 'attempts', 'maxAttempts'])
      .executeTakeFirst()

    if (!verification) {
      await auditLog(event, {
        action: 'reset',
        entity: 'password',
        entityId: 'anonymous',
        metadata: {
          success: false,
          reason: 'invalid_token',
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Invalid or expired reset token', 400)
    }

    if (verification.attempts >= verification.maxAttempts) {
      await auditLog(event, {
        action: 'reset',
        entity: 'password',
        entityId: verification.userId,
        metadata: {
          success: false,
          reason: 'max_attempts_exceeded',
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Maximum reset attempts exceeded', 400)
    }

    const hashedPassword = await hashPassword(body.password, DEFAULT_PASSWORD_ALGORITHM)

    await db.transaction().execute(async (trx) => {
      await trx
        .updateTable('_sq_verifications')
        .set({
          verifiedAt: now,
          attempts: verification.attempts + 1,
          updatedAt: now,
        })
        .where('id', '=', verification.id)
        .execute()

      await trx
        .updateTable('_sq_passwords')
        .set({
          hash: hashedPassword,
          updatedAt: now,
        })
        .where('userId', '=', verification.userId)
        .execute()
    })

    await auditLog(event, {
      action: 'reset',
      entity: 'password',
      entityId: verification.userId,
      metadata: {
        success: true,
        userId: verification.userId,
      },
      retention: 'CRITICAL',
    })

    return createSuccessResponse<IResetPasswordResponse>(event, 'Password reset successful', {
      password: {
        resetAt: toISOString(now),
      },
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
