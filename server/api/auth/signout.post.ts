import { z } from 'zod'

export interface ISignoutResponse {
  sessionId: string
  deviceId?: string | null
}

export const SignoutRequestSchema = z.object({
  sessionId: z.string({ required_error: 'Session ID is required' }),
  deviceId: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const userId = event.context.auth.payload.sub
  const userEmail = event.context.auth.payload.email
  const now = Math.floor(Date.now() / 1000)

  try {
    const body = await requireValidatedBody(event, SignoutRequestSchema)

    const session = await db
      .selectFrom('sessions')
      .where('id', '=', body.sessionId)
      .select(['isActive', 'expiresAt'])
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

      return createErrorResponse(event, 'Session not found', 404)
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

    await db
      .updateTable('sessions')
      .set({
        isActive: 0,
        updatedAt: now,
      })
      .where('id', '=', body.sessionId)
      .execute()

    if (body.deviceId) {
      await db
        .updateTable('sessions')
        .set({
          isActive: 0,
          updatedAt: now,
        })
        .where('deviceId', '=', body.deviceId)
        .where('expiresAt', '>', now)
        .where('isActive', '=', 1)
        .execute()
    }

    await auditLog(event, {
      action: 'logout',
      entity: 'session',
      entityId: body.sessionId,
      metadata: {
        success: true,
        deviceId: body.deviceId,
        signedOutBy: {
          id: userId,
          email: userEmail,
        },
      },
      retention: 'COMPLIANCE',
    })

    deleteCookie(event, 'auth_session')

    return createSuccessResponse<ISignoutResponse>(event, 'Signed out successfully', {
      sessionId: body.sessionId,
      deviceId: body.deviceId,
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
