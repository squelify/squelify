import * as jose from 'jose'

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const token = getRequestHeader(event, 'Authorization')?.replace('Bearer ', '')

  if (!token) {
    return createErrorResponse(401, 'Token tidak ditemukan')
  }

  // Extract key ID from token header
  const decoded = jose.decodeProtectedHeader(token)
  if (!decoded.kid) {
    return createErrorResponse(401, 'Invalid token format')
  }

  const now = Math.floor(Date.now() / 1000)

  // Get JWK used for signing
  const jwk = await db
    .selectFrom('jwks')
    .where('keyId', '=', decoded.kid)
    .where('isActive', '=', 1)
    .where('expiresAt', '>', now)
    .select(['keyId', 'publicKey', 'algorithm'])
    .executeTakeFirst()

  if (!jwk) {
    return createErrorResponse(401, 'Invalid token signature')
  }

  // Verify token and decode payload
  const payload = await verifyAccessToken(token, jwk)
  if (!payload) {
    return createErrorResponse(401, 'Token tidak valid')
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
    return createErrorResponse(401, 'Session tidak valid atau telah berakhir')
  }

  // Return standardized claims
  return {
    status: 200,
    success: true,
    data: {
      sub: payload.sub,
      sid: payload.sid,
      email: payload.email,
      name: payload.name,
      given_name: payload.given_name,
      family_name: payload.family_name,
      locale: payload.locale,
      amr: payload.amr,
      roles: payload.roles,
      perms: payload.perms,
      org_id: payload.org_id,
    },
  }
})
