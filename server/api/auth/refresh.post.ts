import { sha256base64 } from 'ohash'
import { typeid } from 'typeid-js'
import { getActiveJWK } from '~/database/repository/jwk.repo'
import { type JWTPayload, generateAccessToken } from '~/utils/jwt'

export default defineEventHandler(async (event) => {
  const { appConfig, db } = event.context
  const headers = getRequestHeaders(event)
  const userAgent = headers['user-agent'] || 'unknown'
  const userAgentHash = sha256base64(userAgent)

  try {
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
      setResponseStatus(event, 401)
      return createErrorResponse(401, 'Invalid refresh token')
    }

    // Get active JWK
    const activeKey = await getActiveJWK(db)
    if (!activeKey) {
      setResponseStatus(event, 500)
      return createErrorResponse(500, 'No active signing key available')
    }

    // Generate new access token with standard claims
    const payload: JWTPayload = {
      iss: appConfig.baseURL,
      sub: session.userId,
      aud: [userAgentHash],
      exp: now + 900, // 15 minutes
      nbf: now,
      iat: now,
      jti: typeid('tok').toString(),
      sid: session.sessionId,
      given_name: session.firstName,
      family_name: session.lastName,
      email: session.email,
      locale: session.locale,
      amr: ['refresh_token'],
    }

    const accessToken = await generateAccessToken(payload, activeKey, {
      issuer: appConfig.baseURL,
      audience: userAgentHash,
    })

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
  } catch (error) {
    return throwErrorResponse(error)
  }
})
