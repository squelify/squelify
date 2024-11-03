import * as jose from 'jose'
import { z } from 'zod'
import { hashPassword, verifyPassword } from '~/utils/string'

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
  const payload = event.context.auth.payload
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, PasswordUpdateSchema)
    const now = Math.floor(Date.now() / 1000)

    // Get current password
    const currentPassword = await db
      .selectFrom('passwords')
      .where('userId', '=', payload.sub)
      .select(['id', 'hash'])
      .executeTakeFirst()

    if (!currentPassword) {
      return createErrorResponse(event, 'Password not found', 404)
    }

    // Verify current password
    const isValid = await verifyPassword(body.currentPassword, currentPassword.hash)
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
      })

      return createErrorResponse(event, 'Invalid current password', 400)
    }

    // Hash new password
    const hashedPassword = await hashPassword(body.newPassword)

    // Update password
    await db
      .updateTable('passwords')
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
