import { isProduction } from 'std-env'
import { z } from 'zod'
import { createUserSession, verifyUserCredentials } from '~/database/repository/auth.repo'
import { getActiveJWK } from '~/database/repository/jwk.repo'

export const LoginRequestSchema = z.object({
  identity: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  deviceId: z.string().optional(),
  deviceType: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const body = await readValidatedBody(event, (body) => LoginRequestSchema.safeParse(body))

  if (!body.success) {
    return createErrorResponse(400, 'Invalid request', {
      issues: body.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  const { identity, password, deviceId, deviceType = 'browser' } = body.data

  // Get client info
  const headers = getRequestHeaders(event)
  const ipAddress = getRequestIP(event)
  const userAgent = headers['user-agent'] || 'unknown'

  // Get active JWK for token signing
  const activeKey = await getActiveJWK(db)
  if (!activeKey) {
    return createErrorResponse(500, 'No active signing key available')
  }

  // Verify credentials
  const user = await verifyUserCredentials(db, identity, password)
  if (!user) {
    return createErrorResponse(401, 'Email atau password salah')
  }

  // Create session with key tracking
  const session = await createUserSession(db, user.id, {
    ipAddress,
    userAgent,
    deviceId,
    deviceType,
    keyId: activeKey.keyId,
  })

  // Generate tokens with key info
  const payload = {
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    sessionId: session.id,
    kid: activeKey.keyId,
  }

  const accessToken = await generateAccessToken(payload, activeKey)

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
      accessToken,
    },
  }
})
