import { typeid } from 'typeid-js'
import { getActiveJWK } from '~/database/repository/jwk.repo'
import { type JWTPayload, generateAccessToken } from '~/utils/jwt'

export interface IRefreshTokenResponse {
  sessionId: string
  accessToken: string
  validUntil: number
  validityPeriod: number
}

export default defineEventHandler(async (event) => {
  const { appConfig, db } = event.context

  try {
    const { userAgentHash } = getClientInfo(event)
    const { refreshToken } = await readBody<{ refreshToken: string }>(event)
    const now = Math.floor(Date.now() / 1000)

    const sessionQuery = db
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
        .selectFrom('roles')
        .innerJoin('user_roles', 'roles.id', 'user_roles.roleId')
        .where('user_roles.userId', '=', session.userId)
        .select(['roles.name', 'roles.type', 'roles.organizationId'])
        .execute(),

      db
        .selectFrom('permissions')
        .innerJoin('role_permissions', 'permissions.id', 'role_permissions.permissionId')
        .innerJoin('user_roles', 'role_permissions.roleId', 'user_roles.roleId')
        .where('user_roles.userId', '=', session.userId)
        .select(['permissions.action', 'permissions.resource'])
        .execute(),
    ])

    const activeKey = await getActiveJWK(db)
    if (!activeKey) {
      return createErrorResponse(event, 'No active signing key available', 500)
    }

    const payload: JWTPayload = {
      iss: appConfig.baseURL,
      sub: session.userId,
      aud: [userAgentHash],
      exp: now + TOKEN_DURATION.accessToken,
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
      .updateTable('sessions')
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
      sessionId: session.sessionId,
      accessToken,
      validUntil: session.expiresAt,
      validityPeriod: DURATION.MINUTE * 15,
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
