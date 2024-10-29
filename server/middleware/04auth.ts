import type { H3Event } from 'h3'
import * as jose from 'jose'
import { sha256base64 } from 'ohash'
import { env } from 'std-env'
import { z } from 'zod'

const HeadersSchema = z.object({
  'x-client-info': z
    .string({
      required_error: 'X-Client-Info header wajib dicantumkan',
      invalid_type_error: 'X-Client-Info harus berupa string',
    })
    .min(1, 'X-Client-Info tidak boleh kosong'),
})

function validateHeaders(event: H3Event) {
  const headers = getRequestHeaders(event)

  const result = HeadersSchema.safeParse({
    'x-client-info': headers['x-client-info'],
  })

  if (!result.success) {
    setResponseStatus(event, 400)
    throw createError({
      statusCode: 400,
      data: {
        issues: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
      message: 'Invalid request',
    })
  }
}

const publicRoutes = ['/healthz', '/auth/login']

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname
  const headers = getRequestHeaders(event)

  // Only path that starts with `/api` will be checked
  if (!pathname.startsWith('/api')) {
    return
  }

  try {
    validateHeaders(event)
  } catch (error) {
    return throwErrorResponse(error)
  }

  // Skip public API routes, extract actual path without `/api` prefix.
  const apiRequestPath = pathname.replace('/api', '')
  if (publicRoutes.includes(apiRequestPath)) {
    return
  }

  try {
    const { appConfig, db } = event.context
    const sessionId = getCookie(event, 'auth_session')
    const bearerToken = getRequestHeader(event, 'Authorization')?.replace('Bearer ', '')

    logger.debug('[app][mwr]', 'SessionId:', sessionId)

    if (String(env.APP_LOG_LEVEL).toLowerCase() === 'trace') {
      logger.debug('[app][mwr]', 'Bearer Token:', bearerToken)
    }

    if (!bearerToken) {
      setResponseStatus(event, 401)
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // Extract key ID from token header
    const decoded = jose.decodeProtectedHeader(bearerToken)

    if (!decoded.kid) {
      setResponseStatus(event, 401)
      throw createError({ statusCode: 401, message: 'Invalid token format' })
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
      setResponseStatus(event, 401)
      throw createError({ statusCode: 401, message: 'Invalid token signature' })
    }

    // Get client user agent from header
    const userAgent = headers['user-agent'] || 'unknown'
    const userAgentHash = sha256base64(userAgent)

    // Verify token and decode payload
    const payload = await verifyAccessToken(bearerToken, jwk, {
      issuer: appConfig.baseURL,
      audience: userAgentHash,
    })

    if (!payload) {
      setResponseStatus(event, 401)
      throw createError({ statusCode: 401, message: 'Token tidak valid' })
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
      setResponseStatus(event, 401)
      throw createError({ statusCode: 401, message: 'Session tidak valid atau telah berakhir' })
    }

    event.context.auth = { sessionId, bearerToken, payload }
  } catch (error) {
    return throwErrorResponse(error)
  }
})

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

declare module 'h3' {
  interface H3EventContext {
    auth?: {
      sessionId: string
      bearerToken: string
      payload?: VerifiedToken
    }
  }
}
