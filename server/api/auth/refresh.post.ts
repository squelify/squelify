import { typeid } from 'typeid-js'
import { getActiveJWK } from '~/database/repository/jwk.repo'
import { type JWTPayload, generateAccessToken } from '~/utils/jwt'

export interface IRefreshTokenResponse {
  token: {
    accessToken: string
    expiresIn: number
  }
  session: {
    id: string
    lastActiveAt: number
  }
}

export interface IRefreshTokenRequest {
  refreshToken: string
}

export default defineEventHandler(async (event) => {
  const { appConfig, db } = event.context

  try {
    const { userAgentHash } = getClientInfo(event)
    const { refreshToken } = await readBody<IRefreshTokenRequest>(event)
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
      return createErrorResponse(event, 'Invalid refresh token', 401)
    }

    // Get active JWK
    const activeKey = await getActiveJWK(db)
    if (!activeKey) {
      return createErrorResponse(event, 'No active signing key available', 500)
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

    // Log successful token refresh
    await auditLog(event, {
      action: 'refresh',
      entity: 'token',
      entityId: session.sessionId,
      metadata: {
        success: true,
        userId: session.userId,
        sessionId: session.sessionId,
      },
    })

    return createSuccessResponse<IRefreshTokenResponse>(event, 'Token refreshed successfully', {
      token: {
        accessToken,
        expiresIn: 900,
      },
      session: {
        id: session.sessionId,
        lastActiveAt: now,
      },
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
