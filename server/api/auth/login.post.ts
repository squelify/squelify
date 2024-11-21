import { isProduction } from 'std-env'
import { typeid } from 'typeid-js'
import { z } from 'zod'
import { createUserSession, verifyUserCredentials } from '~/database/repository/auth.repo'
import { getActiveJWK } from '~/database/repository/jwk.repo'
import { JWTPayload } from '~/utils/jwt'

export interface ILoginResponse {
  accessToken: string
  refreshToken: string
  sessionId: string
  displayName: string
  sessionExpiry: number
  tokenExpiry: number
  mfaRequired: boolean
  mfaMethod: string | null
  isAdmin: boolean
  roles: string[]
}

export const LoginRequestSchema = z.object({
  identity: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  deviceId: z.string().optional().nullable(),
  deviceType: z.enum(['browser', 'mobile', 'desktop', 'tablet']).default('browser'),
})

export default defineEventHandler(async (event) => {
  const { appConfig, db } = event.context
  const requestId = typeid('req').toString()
  const startTime = Date.now()

  try {
    const { clientIpAddress, userAgent, userAgentHash } = getClientInfo(event)
    const body = await requireValidatedBody(event, LoginRequestSchema)
    const { identity, password, deviceId, deviceType } = body

    // Query non-transactional
    const activeKey = await getActiveJWK(db)
    if (!activeKey) {
      return createErrorResponse(event, 'Authentication service temporarily unavailable', 503)
    }

    const user = await verifyUserCredentials(db, identity, password)
    if (!user) {
      await auditLog(event, {
        action: 'login',
        entity: 'user',
        entityId: 'anonymous',
        metadata: {
          success: false,
          requestId,
          email: identity,
          reason: 'invalid_credentials',
          ipAddress: clientIpAddress,
          userAgent: userAgent?.slice(0, 100),
        },
        retention: 'COMPLIANCE',
      })
      return createErrorResponse(event, 'Invalid credentials', 401)
    }

    // Create session first
    const session = await createUserSession(db, user.id, {
      ipAddress: clientIpAddress,
      userAgent,
      deviceId,
      deviceType,
      keyId: activeKey.id,
    })

    // Query user data in parallel
    const [roles, permissions, twoFactor] = await Promise.all([
      db
        .selectFrom('sq_roles as r')
        .innerJoin('sq_user_roles as urole', 'r.id', 'urole.roleId')
        .where('urole.userId', '=', user.id)
        .select(['r.id', 'r.name', 'r.type', 'r.organizationId'])
        .execute(),

      db
        .selectFrom('sq_permissions as perms')
        .innerJoin('sq_role_permissions as rp', 'perms.id', 'rp.permissionId')
        .innerJoin('sq_user_roles as urole', 'rp.roleId', 'urole.roleId')
        .where('urole.userId', '=', user.id)
        .select([
          'perms.id',
          'perms.name',
          'perms.category',
          'perms.action',
          'perms.resource',
          'perms.conditions',
        ])
        .execute(),

      db
        .selectFrom('sq_two_factors')
        .where('userId', '=', user.id)
        .where('verifiedAt', '!=', null)
        .select(['type'])
        .executeTakeFirst(),
    ])

    const now = Math.floor(Date.now() / 1000)
    const tokenExpiry = now + TOKEN_DURATION.accessToken
    const payload: JWTPayload = {
      iss: appConfig.baseURL,
      sub: user.id,
      aud: [userAgentHash],
      exp: tokenExpiry,
      nbf: now,
      iat: now,
      jti: typeid('tok').toString(),
      sid: session.id,
      given_name: user.firstName,
      family_name: user.lastName,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      amr: ['pwd'],
      roles: roles.map((r) => r.name),
      perms: permissions.map((p) => `${p.action}:${p.resource}`),
      org_id: roles.find((r) => r.type === 'organization')?.organizationId,
    }

    const accessToken = await generateAccessToken(payload, activeKey, {
      issuer: appConfig.baseURL,
      audience: userAgentHash,
    })

    setCookie(event, 'auth_session', session.id, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    await auditLog(event, {
      action: 'login',
      entity: 'user',
      entityId: user.id,
      metadata: {
        success: true,
        requestId,
        sessionId: session.id,
        deviceType,
        ipAddress: clientIpAddress,
        requires2FA: !!twoFactor,
        processingTime: Date.now() - startTime,
      },
      retention: 'COMPLIANCE',
    })

    return createSuccessResponse<ILoginResponse>(event, 'Authentication successful', {
      accessToken,
      refreshToken: session.refreshToken,
      sessionId: session.id,
      displayName: `${user.firstName} ${user.lastName}`.trim(),
      sessionExpiry: session.expiresAt,
      tokenExpiry: tokenExpiry,
      mfaRequired: !!twoFactor,
      mfaMethod: twoFactor?.type || null,
      isAdmin: roles.some((r) => r.name === 'admin'),
      roles: roles.map((r) => r.name),
    })
  } catch (error) {
    if (error instanceof JWTGenerationError) {
      return createErrorResponse(event, 'Token generation failed', 401)
    }
    return throwErrorResponse(event, error)
  }
})
