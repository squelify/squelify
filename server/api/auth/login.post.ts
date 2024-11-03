import { isProduction } from 'std-env'
import { typeid } from 'typeid-js'
import { z } from 'zod'
import { createUserSession, verifyUserCredentials } from '~/database/repository/auth.repo'
import { getActiveJWK } from '~/database/repository/jwk.repo'
import { JWTPayload } from '~/utils/jwt'

// Login request validation schema
export const LoginRequestSchema = z.object({
  identity: z.string().email('Invalid email address format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  deviceId: z.string().optional().nullable(),
  deviceType: z.enum(['browser', 'mobile', 'desktop', 'tablet']).default('browser'),
})

export default defineEventHandler(async (event) => {
  const { appConfig, db } = event.context
  const requestId = typeid('req').toString()

  try {
    const startTime = Date.now()
    logger.info('[auth/login]', {
      requestId,
      message: 'Processing login request',
      timestamp: new Date().toISOString(),
    })

    const { clientIpAddress, userAgent, userAgentHash } = getClientInfo(event)
    const body = await requireValidatedBody(event, LoginRequestSchema)
    const { identity, password, deviceId, deviceType } = body

    // Enhanced request logging
    logger.debug('[auth/login]', {
      requestId,
      message: 'Login attempt details',
      data: {
        email: identity,
        deviceType,
        ipAddress: clientIpAddress,
        userAgent: userAgent?.slice(0, 50),
        timestamp: new Date().toISOString(),
      },
    })

    // Get active JWK
    const activeKey = await getActiveJWK(db)
    if (!activeKey) {
      logger.error('[auth/login]', {
        requestId,
        message: 'Authentication service unavailable - No active JWK',
        timestamp: new Date().toISOString(),
      })
      setResponseStatus(event, 503)
      return createErrorResponse(503, 'Authentication service temporarily unavailable')
    }

    // Verify credentials
    const user = await verifyUserCredentials(db, identity, password)
    if (!user) {
      logger.warn('[auth/login]', {
        requestId,
        message: 'Invalid credentials',
        data: {
          email: identity,
          ipAddress: clientIpAddress,
          timestamp: new Date().toISOString(),
        },
      })

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

      setResponseStatus(event, 401)
      return createErrorResponse(401, 'Invalid email or password')
    }

    // Account status checks
    if (!user.isActive) {
      logger.warn('[auth/login]', {
        requestId,
        message: 'Inactive account login attempt',
        data: {
          userId: user.id,
          email: user.email,
          timestamp: new Date().toISOString(),
        },
      })

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

      setResponseStatus(event, 403)
      return createErrorResponse(403, 'Account is currently inactive')
    }

    if (user.isBanned) {
      const banMessage = user.banReason
        ? `Account access restricted: ${user.banReason}`
        : 'Account access has been restricted'

      logger.warn('[auth/login]', {
        requestId,
        message: 'Banned account login attempt',
        data: {
          userId: user.id,
          email: user.email,
          banReason: user.banReason,
          bannedUntil: user.bannedUntil,
          timestamp: new Date().toISOString(),
        },
      })

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

      setResponseStatus(event, 403)
      return createErrorResponse(403, banMessage)
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
    logger.info('[auth/login]', {
      requestId,
      message: 'Login successful',
      data: {
        userId: user.id,
        email: user.email,
        sessionId: session.id,
        requires2FA: !!twoFactor,
        deviceType,
        ipAddress: clientIpAddress,
        processingTime,
        timestamp: new Date().toISOString(),
      },
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
        processingTime,
      },
    })

    return {
      status: 200,
      success: true,
      message: 'Authentication successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        session: {
          id: session.id,
          refreshToken: session.refreshToken,
        },
        security: {
          requires2FA: !!twoFactor,
          type: twoFactor?.type || null,
        },
        accessToken,
      },
    }
  } catch (error) {
    logger.error('[auth/login]', {
      requestId,
      message: 'Login process failed',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      timestamp: new Date().toISOString(),
    })

    if (error instanceof JWTGenerationError) {
      setResponseStatus(event, 401)
      return createErrorResponse(401, 'Token generation failed')
    }
    return throwErrorResponse(error)
  }
})
