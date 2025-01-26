import { typeid } from 'typeid-js'
import { getActiveJWK } from '~/database/repository/jwk.repo'
import { type JWTPayload, generateAccessToken } from '~/utils/jwt'

export interface IRefreshTokenResponse {
  accessToken: string
  sessionId: string
  sessionExpiry: number
  tokenExpiry: number
}

export default defineEventHandler(async (event) => {
  const { appConfig, db } = event.context

  try {
    const { userAgentHash } = getClientInfo(event)
    const { refreshToken } = await readBody<{ refreshToken: string }>(event)
    const now = Math.floor(Date.now() / 1000)

    const sessionQuery = db
      .selectFrom('_sq_sessions as sessions')
      .innerJoin('_sq_users as users', 'users.id', 'sessions.userId')
      .innerJoin('_sq_emails as emails', 'emails.userId', 'users.id')
      .where('sessions.refreshToken', '=', refreshToken)
      .where('sessions.isActive', '=', 1)
      .where('sessions.expiresAt', '>', now)
      .where('emails.isPrimary', '=', 1)
      .select([
        'sessions.id as sessionId',
        'sessions.userId',
        'sessions.expiresAt',
        'users.firstName',
        'users.lastName',
        'emails.email',
      ])
      .executeTakeFirst()

    const [session] = await Promise.all([sessionQuery])

    if (!session) {
      await auditLog(event, {
        action: 'refresh',
        entity: 'token',
        entityId: refreshToken,
        metadata: {
          success: false,
          reason: 'invalid_token',
        },
        retention: 'COMPLIANCE',
      })

      return createErrorResponse(event, 'Invalid refresh token', 401)
    }

    const [roles, permissions] = await Promise.all([
      db
        .selectFrom('_sq_roles as r')
        .innerJoin('_sq_user_roles as urole', 'r.id', 'urole.roleId')
        .where('urole.userId', '=', session.userId)
        .select(['r.name', 'r.type', 'r.organizationId'])
        .execute(),

      db
        .selectFrom('_sq_permissions as perms')
        .innerJoin('_sq_role_permissions as rp', 'perms.id', 'rp.permissionId')
        .innerJoin('_sq_user_roles as urole', 'rp.roleId', 'urole.roleId')
        .where('urole.userId', '=', session.userId)
        .select(['perms.action', 'perms.resource'])
        .execute(),
    ])

    const activeKey = await getActiveJWK(db)
    if (!activeKey) {
      return createErrorResponse(event, 'No active signing key available', 500)
    }

    const tokenExpiry = now + TOKEN_DURATION.accessToken
    const payload: JWTPayload = {
      iss: appConfig.baseURL,
      sub: session.userId,
      aud: [userAgentHash],
      exp: tokenExpiry,
      nbf: now,
      iat: now,
      jti: typeid('tok').toString(),
      sid: session.sessionId,
      given_name: session.firstName,
      family_name: session.lastName,
      email: session.email,
      amr: ['refresh_token'],
      roles: roles.map((r) => r.name),
      perms: permissions.map((p) => `${p.action}:${p.resource}`),
      org_id: roles.find((r) => r.type === 'organization')?.organizationId,
    }

    const accessToken = await generateAccessToken(payload, activeKey, {
      issuer: appConfig.baseURL,
      audience: userAgentHash,
    })

    await db
      .updateTable('_sq_sessions')
      .set({ lastActiveAt: now })
      .where('id', '=', session.sessionId)
      .execute()

    await auditLog(event, {
      action: 'refresh',
      entity: 'token',
      entityId: session.sessionId,
      metadata: {
        success: true,
        userId: session.userId,
        sessionId: session.sessionId,
      },
      retention: 'COMPLIANCE',
    })

    return createSuccessResponse<IRefreshTokenResponse>(event, 'Token refreshed successfully', {
      accessToken,
      sessionId: session.sessionId,
      sessionExpiry: session.expiresAt,
      tokenExpiry: tokenExpiry,
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
