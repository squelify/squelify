import type { H3Event } from 'h3'
import * as jose from 'jose'

// Interface untuk hasil verifikasi token yang lebih lengkap
interface VerifiedToken {
  sub: string
  sid: string
  email: string
  name?: string
  given_name?: string
  family_name?: string
  locale?: string
  amr?: string[]
  roles?: string[]
  perms?: string[]
  org_id?: string
}

// Middleware untuk memverifikasi token dan mengembalikan payload
export async function requireAuth(event: H3Event): Promise<VerifiedToken> {
  const db = event.context.db
  const token = getRequestHeader(event, 'Authorization')?.replace('Bearer ', '')
  const now = Math.floor(Date.now() / 1000)

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  // Extract key ID from token header
  const decoded = jose.decodeProtectedHeader(token)
  if (!decoded.kid) {
    throw createError({
      statusCode: 401,
      message: 'Invalid token format',
    })
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
    throw createError({
      statusCode: 401,
      message: 'Invalid token signature',
    })
  }

  // Verify token and decode payload
  const payload = await verifyAccessToken(token, jwk)
  if (!payload) {
    throw createError({
      statusCode: 401,
      message: 'Token tidak valid',
    })
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
    throw createError({
      statusCode: 401,
      message: 'Session tidak valid atau telah berakhir',
    })
  }

  return payload as VerifiedToken
}
