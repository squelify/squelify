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

    // Check if session exists and still valid
    const session = await db
      .selectFrom('sessions')
      .where('id', '=', body.sessionId)
      .select(['isActive', 'expiresAt'])
      .executeTakeFirst()

    if (!session) {
      return createErrorResponse(event, 'Session not found', 404)
    }

    if (session.expiresAt < now) {
      return createErrorResponse(event, 'Session has expired', 400)
    }

    if (!session.isActive) {
      return createErrorResponse(event, 'Session is already inactive', 400)
    }

    // Deactivate session
    await db
      .updateTable('sessions')
      .set({
        isActive: 0,
        updatedAt: now,
      })
      .where('id', '=', body.sessionId)
      .execute()

    // If deviceId provided, deactivate all sessions for that device
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

    // Log successful signout
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
    })

    // Remove session cookie
    deleteCookie(event, 'auth_session')

    return createSuccessResponse<ISignoutResponse>(event, 'Signed out successfully', {
      sessionId: body.sessionId,
      deviceId: body.deviceId,
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
