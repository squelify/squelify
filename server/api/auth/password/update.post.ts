import { z } from 'zod'
import { hashPassword, verifyPassword } from '~/utils/security'

export interface IUpdatePasswordResponse {
  password: {
    updatedAt: string
  }
}

const PasswordUpdateSchema = z
  .object({
    currentPassword: z.string({ required_error: 'Current password is required' }),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain uppercase letters')
      .regex(/[a-z]/, 'Password must contain lowercase letters')
      .regex(/[0-9]/, 'Password must contain numbers')
      .regex(/[^A-Za-z0-9]/, 'Password must contain special characters'),
  })
  .strict()

export default defineEventHandler(async (event) => {
  const payload = event.context.auth?.payload
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, PasswordUpdateSchema)
    const now = Math.floor(Date.now() / 1000)

    const currentPassword = await db
      .selectFrom('_sq_passwords')
      .where('userId', '=', payload.sub)
      .select(['id', 'hash', 'algorithm'])
      .executeTakeFirst()

    if (!currentPassword) {
      await auditLog(event, {
        action: 'update',
        entity: 'password',
        entityId: payload.sub,
        metadata: {
          success: false,
          reason: 'password_not_found',
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Password not found', 404)
    }

    const isValid = await verifyPassword(
      body.currentPassword,
      currentPassword.hash,
      currentPassword.algorithm
    )

    if (!isValid) {
      await auditLog(event, {
        action: 'update',
        entity: 'password',
        entityId: currentPassword.id,
        metadata: {
          success: false,
          reason: 'invalid_current_password',
          userId: payload.sub,
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Invalid current password', 400)
    }

    const hashedPassword = await hashPassword(body.newPassword, currentPassword.algorithm)

    await db
      .updateTable('_sq_passwords')
      .set({
        hash: hashedPassword,
        updatedAt: now,
      })
      .where('id', '=', currentPassword.id)
      .execute()

    await auditLog(event, {
      action: 'update',
      entity: 'password',
      entityId: currentPassword.id,
      metadata: {
        success: true,
        userId: payload.sub,
      },
      retention: 'CRITICAL',
    })

    return createSuccessResponse<IUpdatePasswordResponse>(event, 'Password updated successfully', {
      password: {
        updatedAt: toISOString(now),
      },
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
