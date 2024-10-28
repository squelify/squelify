import { z } from 'zod'

const SignoutRequestSchema = z.object({
  sessionId: z.string({ required_error: 'Session ID is required' }),
  deviceId: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const body = await readValidatedBody(event, (body) => SignoutRequestSchema.safeParse(body))

  if (!body.success) {
    return createErrorResponse(400, 'Invalid request', {
      issues: body.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  const now = Math.floor(Date.now() / 1000)

  // Check if session exists and still valid
  const session = await db
    .selectFrom('sessions')
    .where('id', '=', body.data.sessionId)
    .select(['isActive', 'expiresAt'])
    .executeTakeFirst()

  if (!session) {
    return createErrorResponse(404, 'Session tidak ditemukan')
  }

  if (session.expiresAt < now) {
    return createErrorResponse(400, 'Session sudah tidak berlaku')
  }

  if (!session.isActive) {
    return createErrorResponse(400, 'Session sudah tidak aktif')
  }

  // Deactivate session
  await db
    .updateTable('sessions')
    .set({
      isActive: 0,
      updatedAt: now,
    })
    .where('id', '=', body.data.sessionId)
    .execute()

  // If deviceId provided, deactivate all sessions for that device
  if (body.data.deviceId) {
    await db
      .updateTable('sessions')
      .set({
        isActive: 0,
        updatedAt: now,
      })
      .where('deviceId', '=', body.data.deviceId)
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
})
