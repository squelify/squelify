import * as jose from 'jose'

export default defineEventHandler(async (event) => {
  try {
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

    // Get user's emails
    const rawEmails = await db
      .selectFrom('emails')
      .where('userId', '=', payload.sub)
      .select(['id', 'email', 'isPrimary', 'isVerified', 'verifiedAt', 'createdAt', 'updatedAt'])
      .orderBy('isPrimary', 'desc')
      .orderBy('createdAt', 'desc')
      .execute()

    // Transform data for response
    const emails = rawEmails.map((email) => ({
      id: email.id,
      email: email.email,
      isPrimary: Boolean(email.isPrimary),
      isVerified: Boolean(email.isVerified),
      verifiedAt: email.verifiedAt ? new Date(email.verifiedAt * 1000).toISOString() : null,
      createdAt: new Date(email.createdAt * 1000).toISOString(),
      updatedAt: email.updatedAt ? new Date(email.updatedAt * 1000).toISOString() : null,
    }))

    return {
      status: 200,
      success: true,
      data: emails,
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
