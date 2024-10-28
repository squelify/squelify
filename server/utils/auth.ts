import type { H3Event } from 'h3'
import * as jose from 'jose'

interface AuthResult {
  success: boolean
  error?: {
    status: number
    success: boolean
    message: string
  }
  data?: {
    user: {
      id: string
      email: string
    }
    session: {
      id: string
    }
  }
}

export async function requireAuth(event: H3Event): Promise<AuthResult> {
  const db = event.context.db
  const now = Math.floor(Date.now() / 1000)
  const token = getRequestHeader(event, 'Authorization')?.replace('Bearer ', '')

  if (!token) {
    return {
      success: false,
      error: createErrorResponse(401, 'Unauthorized'),
    }
  }

  // Extract key ID from token header
  const decoded = jose.decodeProtectedHeader(token)
  if (!decoded.kid) {
    return {
      success: false,
      error: createErrorResponse(401, 'Invalid token format'),
    }
  }

  // Get JWK used for signing
  const jwk = await db
    .selectFrom('jwks')
    .where('keyId', '=', decoded.kid)
    .where('isActive', '=', 1)
    .where('expiresAt', '>', now)
    .select(['keyId', 'publicKey', 'algorithm'])
    .executeTakeFirst()

  if (!jwk) {
    return {
      success: false,
      error: createErrorResponse(401, 'Invalid token signature'),
    }
  }

  // Verify token and decode payload
  const payload = await verifyAccessToken(token, jwk)
  if (!payload) {
    return {
      success: false,
      error: createErrorResponse(401, 'Token tidak valid'),
    }
  }

  // Check if session is still valid
  const session = await db
    .selectFrom('sessions')
    .where('id', '=', payload.sid)
    .where('userId', '=', payload.sub)
    .where('isActive', '=', 1)
    .where('expiresAt', '>', now)
    .select(['id'])
    .executeTakeFirst()

  if (!session) {
    return {
      success: false,
      error: createErrorResponse(401, 'Session tidak valid atau telah berakhir'),
    }
  }

  return {
    success: true,
    data: {
      user: {
        id: payload.sub,
        email: payload.email,
      },
      session: {
        id: session.id,
      },
    },
  }
}
