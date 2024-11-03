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
    fullName: string
  }
  session: {
    id: string
    refreshToken: string
    expiresAt: number
  }
  security: {
    requires2FA: boolean
    type2FA: string | null
    amr: string[]
  }
  token: {
    accessToken: string
    expiresIn: number
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

  try {
    const startTime = Date.now()
    const { clientIpAddress, userAgent, userAgentHash } = getClientInfo(event)
    const body = await requireValidatedBody(event, LoginRequestSchema)
    const { identity, password, deviceId, deviceType } = body

    // Get active JWK
    const activeKey = await getActiveJWK(db)
    if (!activeKey) {
      return createErrorResponse(event, 'Authentication service temporarily unavailable', 503)
    }

    // Verify credentials
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
      })

      return createErrorResponse(event, 'Invalid email or password', 401)
    }

    // Account status checks
    if (!user.isActive) {
      await auditLog(event, {
        action: 'login',
        entity: 'user',
        entityId: user.id,
        metadata: {
          success: false,
          requestId,
          reason: 'inactive_account',
          ipAddress: clientIpAddress,
        },
      })

      return createErrorResponse(event, 'Account is currently inactive', 403)
    }

    if (user.isBanned) {
      const banMessage = user.banReason
        ? `Account access restricted: ${user.banReason}`
        : 'Account access has been restricted'

      await auditLog(event, {
        action: 'login',
        entity: 'user',
        entityId: user.id,
        metadata: {
          success: false,
          requestId,
          reason: 'banned_account',
          banReason: user.banReason,
          bannedUntil: user.bannedUntil,
          ipAddress: clientIpAddress,
        },
      })

      return createErrorResponse(event, banMessage, 403)
    }

    // Create session with enhanced logging
    const session = await createUserSession(db, user.id, {
      ipAddress: clientIpAddress,
      userAgent,
      deviceId,
      deviceType,
      keyId: activeKey.id,
    })

    // JWT generation
    const now = Math.floor(Date.now() / 1000)
    const payload: JWTPayload = {
      iss: appConfig.baseURL,
      sub: user.id,
      aud: [userAgentHash],
      exp: now + 900,
      nbf: now,
      iat: now,
      jti: typeid('tok').toString(),
      sid: session.id,
      given_name: user.firstName,
      family_name: user.lastName,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      locale: user.locale,
      amr: ['pwd'],
    }

    const accessToken = await generateAccessToken(payload, activeKey, {
      issuer: appConfig.baseURL,
      audience: userAgentHash,
    })

    // 2FA check
    const twoFactor = await db
      .selectFrom('two_factors')
      .where('userId', '=', user.id)
      .where('isVerified', '=', 1)
      .select(['type'])
      .executeTakeFirst()

    // Set secure session
    setCookie(event, 'auth_session', session.id, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    const processingTime = Date.now() - startTime

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
        processingTime,
      },
    })

    return createSuccessResponse<ILoginResponse>(event, 'Authentication successful', {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
      },
      session: {
        id: session.id,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
      },
      security: {
        requires2FA: !!twoFactor,
        type2FA: twoFactor?.type || null,
        amr: ['pwd'],
      },
      token: {
        accessToken,
        expiresIn: 900,
      },
    })
  } catch (error) {
    if (error instanceof JWTGenerationError) {
      return createErrorResponse(event, 'Token generation failed', 401)
    }
    return throwErrorResponse(event, error)
  }
})
