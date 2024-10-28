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

  // Get JWK used for signing
  const jwk = await db
    .selectFrom('jwks')
    .where('keyId', '=', decoded.kid)
    .select(['keyId', 'publicKey', 'algorithm'])
    .executeTakeFirst()

  if (!jwk) {
    return createErrorResponse(401, 'Invalid token signature')
  }

  const payload = await verifyAccessToken(token, jwk)
  if (!payload) {
    return createErrorResponse(401, 'Token tidak valid')
  }

  return {
    status: 200,
    success: true,
    data: payload,
  }
})
