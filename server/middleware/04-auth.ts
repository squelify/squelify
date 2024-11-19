import type { H3Event } from 'h3'
import * as jose from 'jose'
import { env } from 'std-env'
import { z } from 'zod'
import { getJWKByKeyId } from '~/database/repository/jwk.repo'
import type { JWTPayload } from '~/utils/jwt'

const HeadersSchema = z.object({
  'x-client-info': z
    .string({
      required_error: 'X-Client-Info header wajib dicantumkan',
      invalid_type_error: 'X-Client-Info harus berupa string',
    })
    .min(1, 'X-Client-Info tidak boleh kosong'),
})

const UNPROTECTED_ROUTES = [
  '/auth/login',
  '/auth/signup',
  '/auth/email/verify',
  '/auth/password/forgot',
  '/auth/password/reset',
  '/jwks/keys.json',
]

// Check if pathname is root path (empty or `/`)
const isRootPath = (pathname: string) => pathname === '' || pathname === '/'

function validateRequiredHeaders(event: H3Event) {
  const pathname = getRequestURL(event).pathname
  const headers = getRequestHeaders(event)
  const apiRequestPath = pathname.replace('/api', '')

  // Exclude some paths from validation
  const excludedPaths = ['/jwks/keys.json']

  if (isRootPath(apiRequestPath) || excludedPaths.includes(apiRequestPath)) {
    return
  }

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

declare module 'h3' {
  interface H3EventContext {
    auth?: {
      sessionId: string
      bearerToken: string
      payload: JWTPayload
      session?: {
        id: string
        exp: string
      }
    }
  }
}

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname
  const { appConfig, db } = event.context

  // Only path that starts with `/api` will be checked, except for some paths.
  if (
    !pathname.startsWith('/api') ||
    pathname.startsWith('/api/healthz') ||
    pathname.startsWith('/api/settings') ||
    pathname.startsWith('/api-docs') ||
    pathname === '/api-specs.json'
  ) {
    return
  }

  try {
    // Validate X-Client-Info header
    validateRequiredHeaders(event)

    // Skip public API routes, extract actual path without `/api` prefix.
    const apiRequestPath = pathname.replace('/api', '')
    if (isRootPath(apiRequestPath) || UNPROTECTED_ROUTES.includes(apiRequestPath)) {
      return
    }

    const sessionId = getCookie(event, 'auth_session')
    const bearerToken = getRequestHeader(event, 'Authorization')?.replace('Bearer ', '')

    logger.debug('[midw]', 'SessionId:', sessionId)

    if (String(env.SQUELIFY_LOG_LEVEL).toLowerCase() === 'trace') {
      logger.debug('[midw]', 'Bearer Token:', bearerToken)
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
    const jwk = await getJWKByKeyId(db, decoded.kid)
    if (!jwk) {
      setResponseStatus(event, 401)
      throw createError({ statusCode: 401, message: 'Invalid token signature' })
    }

    // Get client user agent from header
    const { userAgentHash } = getClientInfo(event)

    // Import public key for verification
    const publicKey = await jose.importSPKI(jwk.publicKey, jwk.algorithm)

    // Verify token and decode payload
    const { payload } = await jose.jwtVerify<JWTPayload>(bearerToken, publicKey, {
      issuer: appConfig.baseURL,
      audience: userAgentHash,
    })

    // Check if session is still valid
    const session = await db
      .selectFrom('sq_sessions')
      .where('id', '=', payload.sid)
      .where('userId', '=', payload.sub)
      .where('isActive', '=', 1)
      .where('expiresAt', '>', now)
      .select(['id', 'expiresAt'])
      .executeTakeFirst()

    if (!session) {
      setResponseStatus(event, 401)
      throw createError({ statusCode: 401, message: 'Session tidak valid atau telah berakhir' })
    }

    event.context.auth = {
      sessionId,
      bearerToken,
      payload,
      session: {
        id: session.id,
        exp: toISOString(session.expiresAt),
      },
    }
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
