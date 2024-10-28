import { typeid } from 'typeid-js'
import { getActiveJWK } from '~/database/repository/jwk.repo'

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const { refreshToken } = await readBody(event)

  const now = Math.floor(Date.now() / 1000)

  // Get session by refresh token
  const session = await db
    .selectFrom('sessions')
    .innerJoin('users', 'users.id', 'sessions.userId')
    .innerJoin('emails', 'emails.userId', 'users.id')
    .where('sessions.refreshToken', '=', refreshToken)
    .where('sessions.isActive', '=', 1)
    .where('sessions.expiresAt', '>', now)
    .where('emails.isPrimary', '=', 1)
    .select([
      'sessions.id as sessionId',
      'sessions.userId',
      'users.firstName',
      'users.lastName',
      'users.locale',
      'emails.email',
    ])
    .executeTakeFirst()

  if (!session) {
    return createErrorResponse(401, 'Invalid refresh token')
  }

  // Get active JWK
  const activeKey = await getActiveJWK(db)
  if (!activeKey) {
    return createErrorResponse(500, 'No active signing key available')
  }

  // Generate new access token with standard claims
  const payload: JWTPayload = {
    iss: 'auth-service',
    sub: session.userId,
    aud: ['api://default'],
    exp: now + 900, // 15 minutes
    nbf: now,
    iat: now,
    jti: typeid('tok').toString(),
    sid: session.sessionId,

    given_name: session.firstName,
    family_name: session.lastName,
    name: `${session.firstName} ${session.lastName}`.trim(),
    email: session.email,
    locale: session.locale,

    amr: ['refresh_token'],
  }

  const accessToken = await generateAccessToken(payload, activeKey)

  // Update session last active timestamp
  await db
    .updateTable('sessions')
    .set({ lastActiveAt: now })
    .where('id', '=', session.sessionId)
    .execute()

  return {
    status: 200,
    success: true,
    data: { accessToken },
  }
})
