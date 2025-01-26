import { isProduction } from 'std-env'
import { z } from 'zod'

export const SignoutRequestSchema = z.object({
  sessionId: z.string({ required_error: 'Session ID is required' }),
  deviceId: z.string().optional().nullable(),
  allDevices: z.boolean().optional().default(false),
})

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const userId = event.context.auth?.payload.sub
  const userEmail = event.context.auth?.payload.email
  const now = Math.floor(Date.now() / 1000)

  try {
    const body = await requireValidatedBody(event, SignoutRequestSchema)

    // Validate current session
    const session = await db
      .selectFrom('_sq_sessions')
      .where('id', '=', body.sessionId)
      .select(['isActive', 'expiresAt', 'deviceId'])
      .executeTakeFirst()

    if (!session) {
      await auditLog(event, {
        action: 'logout',
        entity: 'session',
        entityId: body.sessionId,
        metadata: {
          success: false,
          reason: 'session_not_found',
          deviceId: body.deviceId,
        },
        retention: 'COMPLIANCE',
      })
      return createErrorResponse(event, 'Session not found', 400)
    }

    if (session.expiresAt < now) {
      await auditLog(event, {
        action: 'logout',
        entity: 'session',
        entityId: body.sessionId,
        metadata: {
          success: false,
          reason: 'session_expired',
          deviceId: body.deviceId,
        },
        retention: 'COMPLIANCE',
      })
      return createErrorResponse(event, 'Session has expired', 400)
    }

    if (!session.isActive) {
      await auditLog(event, {
        action: 'logout',
        entity: 'session',
        entityId: body.sessionId,
        metadata: {
          success: false,
          reason: 'session_inactive',
          deviceId: body.deviceId,
        },
        retention: 'COMPLIANCE',
      })
      return createErrorResponse(event, 'Session is already inactive', 400)
    }

    // Deactivate current session
    await db
      .updateTable('_sq_sessions')
      .set({
        isActive: 0,
        updatedAt: now,
      })
      .where('id', '=', body.sessionId)
      .execute()

    // Handle device-specific or all devices logout
    const logoutQuery = db
      .updateTable('_sq_sessions')
      .set({
        isActive: 0,
        updatedAt: now,
      })
      .where('expiresAt', '>', now)
      .where('isActive', '=', 1)

    if (body.allDevices) {
      await logoutQuery.where('userId', '=', userId).execute()
    } else if (body.deviceId || session.deviceId) {
      await logoutQuery.where('deviceId', '=', body.deviceId || session.deviceId).execute()
    }

    await auditLog(event, {
      action: 'logout',
      entity: 'session',
      entityId: body.sessionId,
      metadata: {
        success: true,
        deviceId: body.deviceId,
        allDevices: body.allDevices,
        signedOutBy: {
          id: userId,
          email: userEmail,
        },
      },
      retention: 'COMPLIANCE',
    })

    deleteCookie(event, 'auth_session', {
      path: '/',
      sameSite: 'lax',
      secure: isProduction,
      httpOnly: true,
    })

    return createSuccessResponse(event, 'Signed out successfully')
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
