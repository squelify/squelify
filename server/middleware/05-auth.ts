import { LibsqlError } from '@libsql/client'
import type { H3Event } from 'h3'
import * as jose from 'jose'
import { JWTClaimValidationFailed, JWTExpired, JWTInvalid } from 'jose/errors'
import { ZodError, z } from 'zod'
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

    if (!bearerToken) {
      return createErrorResponse(event, 'Bearer token is required', 401)
    }

    // Extract key ID from token header
    let decoded: jose.ProtectedHeaderParameters

    try {
      decoded = jose.decodeProtectedHeader(bearerToken)
    } catch (_err) {
      return createErrorResponse(event, 'Malformed authorization token', 400)
    }

    if (!decoded.kid) {
      return createErrorResponse(event, 'Missing key identifier in token', 401)
    }

    const now = Math.floor(Date.now() / 1000)

    // Get JWK used for signing
    const jwk = await getJWKByKeyId(db, decoded.kid)
    if (!jwk) {
      return createErrorResponse(event, 'Token signing key not found', 401)
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
      return createErrorResponse(event, 'Session is invalid or has expired', 401)
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
    if (error instanceof JWTClaimValidationFailed) {
      return createErrorResponse(event, 'Your session has invalid permissions or claims', 403)
    }
    if (error instanceof JWTVerificationError) {
      return createErrorResponse(event, 'Your session token is invalid', 401)
    }
    if (error instanceof JWTExpired) {
      return createErrorResponse(event, 'Your session has expired, please sign in again', 401)
    }
    if (error instanceof JWTInvalid) {
      return createErrorResponse(event, 'Your session token format is invalid', 400)
    }
    if (error instanceof ZodError) {
      return createErrorResponse(event, 'Required headers are missing or invalid', 400)
    }
    if (error instanceof LibsqlError) {
      return createErrorResponse(event, 'Authentication service is temporarily unavailable', 503)
    }
    return throwErrorResponse(event, error)
  }
})
