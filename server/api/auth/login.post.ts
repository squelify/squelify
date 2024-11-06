import { isProduction } from 'std-env'
import { typeid } from 'typeid-js'
import { z } from 'zod'
import { createUserSession, verifyUserCredentials } from '~/database/repository/auth.repo'
import { getActiveJWK } from '~/database/repository/jwk.repo'
import { JWTPayload } from '~/utils/jwt'

export interface ILoginResponse {
  user: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    displayName: string
    roles: string[]
    permissions: string[]
    organizationId: string | null
    isAdmin: boolean
  }
  credentials: {
    sessionId: string
    accessToken: string
    refreshToken: string
    validUntil: number
    validityPeriod: number
    mfaRequired: boolean
    mfaMethod: string | null
  }
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
      return createErrorResponse(event, 'Invalid email or password', 401)
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
        .selectFrom('roles')
        .innerJoin('user_roles', 'roles.id', 'user_roles.roleId')
        .where('user_roles.userId', '=', user.id)
        .select(['roles.id', 'roles.name', 'roles.type', 'roles.organizationId'])
        .execute(),

      db
        .selectFrom('permissions')
        .innerJoin('role_permissions', 'permissions.id', 'role_permissions.permissionId')
        .innerJoin('user_roles', 'role_permissions.roleId', 'user_roles.roleId')
        .where('user_roles.userId', '=', user.id)
        .select([
          'permissions.id',
          'permissions.name',
          'permissions.category',
          'permissions.action',
          'permissions.resource',
          'permissions.conditions',
        ])
        .execute(),

      db
        .selectFrom('two_factors')
        .where('userId', '=', user.id)
        .where('isVerified', '=', 1)
        .select(['type'])
        .executeTakeFirst(),

      db
        .selectFrom('user_metadata')
        .where('userId', '=', user.id)
        .where('isPublic', '=', 1)
        .select(['key', 'value'])
        .execute(),
    ])

    const now = Math.floor(Date.now() / 1000)
    const payload: JWTPayload = {
      iss: appConfig.baseURL,
      sub: user.id,
      aud: [userAgentHash],
      exp: now + TOKEN_DURATION.accessToken,
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
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: `${user.firstName} ${user.lastName}`.trim(),
        roles: roles.map((r) => r.name),
        permissions: permissions.map((p) => `${p.action}:${p.resource}`),
        organizationId: roles.find((r) => r.type === 'organization')?.organizationId || null,
        isAdmin: roles.some((r) => r.name === 'admin'),
      },
      credentials: {
        sessionId: session.id,
        accessToken,
        refreshToken: session.refreshToken,
        validUntil: session.expiresAt,
        validityPeriod: DURATION.MINUTE * 15,
        mfaRequired: !!twoFactor,
        mfaMethod: twoFactor?.type || null,
      },
    })
  } catch (error) {
    if (error instanceof JWTGenerationError) {
      return createErrorResponse(event, 'Token generation failed', 401)
    }
    return throwErrorResponse(event, error)
  }
})
