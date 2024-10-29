import { sha256base64 } from 'ohash'
import { isProduction } from 'std-env'
import { typeid } from 'typeid-js'
import { z } from 'zod'
import { createUserSession, verifyUserCredentials } from '~/database/repository/auth.repo'
import { getActiveJWK } from '~/database/repository/jwk.repo'
import { JWTPayload } from '~/utils/jwt'

export const LoginRequestSchema = z.object({
  identity: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  deviceId: z.string().optional().nullable(),
  deviceType: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const { appConfig, db } = event.context

  try {
    const body = await requireValidatedBody(event, LoginRequestSchema)
    const { identity, password, deviceId, deviceType = 'browser' } = body

    // Get client info
    const headers = getRequestHeaders(event)
    const ipAddress = getRequestIP(event)
    const userAgent = headers['user-agent'] || 'unknown'

    // Get active JWK for token signing
    const activeKey = await getActiveJWK(db)
    if (!activeKey) {
      setResponseStatus(event, 500)
      return createErrorResponse(500, 'No active signing key available')
    }

    // Verify credentials
    const user = await verifyUserCredentials(db, identity, password)
    if (!user) {
      setResponseStatus(event, 401)
      return createErrorResponse(401, 'Email atau password salah')
    }

    // Create session with key tracking
    const session = await createUserSession(db, user.id, {
      ipAddress,
      userAgent,
      deviceId,
      deviceType,
      keyId: activeKey.id, // Use the JWK id instead of keyId
    })

    // Generate tokens with key info
    const now = Math.floor(Date.now() / 1000)
    const payload: JWTPayload = {
      iss: 'auth-service',
      sub: user.id,
      aud: ['api://default'],
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

      amr: ['pwd'], // Password authentication
    }

    const userAgentHash = sha256base64(userAgent)
    const accessToken = await generateAccessToken(payload, activeKey, {
      issuer: appConfig.baseURL,
      audience: userAgentHash,
    })

    const twoFactor = await db
      .selectFrom('two_factors')
      .where('userId', '=', user.id)
      .where('isVerified', '=', 1)
      .select(['type'])
      .executeTakeFirst()

    // Set secure session cookie
    setCookie(event, 'auth_session', session.id, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return {
      status: 200,
      success: true,
      message: 'Login berhasil',
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
    if (error instanceof JWTGenerationError) {
      setResponseStatus(event, 401)
      return createErrorResponse(401, 'Invalid token signature')
    }
    return throwErrorResponse(error)
  }
})
