import { z } from 'zod'

export const SignoutRequestSchema = z.object({
  sessionId: z.string({ required_error: 'Session ID is required' }),
  deviceId: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, SignoutRequestSchema)
    const now = Math.floor(Date.now() / 1000)

    // Check if session exists and still valid
    const session = await db
      .selectFrom('sessions')
      .where('id', '=', body.sessionId)
      .select(['isActive', 'expiresAt'])
      .executeTakeFirst()

    if (!session) {
      setResponseStatus(event, 404)
      return createErrorResponse(404, 'Session tidak ditemukan')
    }

    if (session.expiresAt < now) {
      setResponseStatus(event, 400)
      return createErrorResponse(400, 'Session sudah tidak berlaku')
    }

    if (!session.isActive) {
      setResponseStatus(event, 400)
      return createErrorResponse(400, 'Session sudah tidak aktif')
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

    // Remove session cookie
    deleteCookie(event, 'auth_session')

    return {
      status: 200,
      success: true,
      message: 'Signed out successfully',
    }
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
