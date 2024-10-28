import { getActiveJWK } from '~/database/repository/jwk.repo'

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const { refreshToken } = await readBody(event)

  // Get session by refresh token
  const session = await db
    .selectFrom('sessions')
    .where('refreshToken', '=', refreshToken)
    .where('isActive', '=', 1)
    .where('expiresAt', '>', new Date().toISOString())
    .select(['id', 'userId', 'keyId'])
    .executeTakeFirst()

  if (!session) {
    return createErrorResponse(401, 'Invalid refresh token')
  }

  // Get active JWK
  const activeKey = await getActiveJWK(db)
  if (!activeKey) {
    return createErrorResponse(500, 'No active signing key available')
  }

  // Generate new access token
  const payload = {
    userId: session.userId,
    sessionId: session.id,
    kid: activeKey.keyId,
  }

  const accessToken = await generateAccessToken(payload, activeKey)

  return {
    status: 200,
    success: true,
    data: { accessToken },
  }
})
