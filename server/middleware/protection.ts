// TODO: revamp this middleware, protect routes with CSRF first then API Key

import { handleCors } from 'h3'
import { typeid } from 'typeid-js'
import { ApiKeyValidationError, validateApiKey } from '~/database/repository/api_key.repo'
import { validateCSRFToken } from '~/utils/string'
import appConfig from '~~/app.config'

// Build allowed origins pattern
const ALLOWED_ORIGIN_PATTERN = new RegExp(
  `^(${['http', 'https'].join('|')}):\\/\\/(${[
    ...appConfig.allowedCorsDomains.LOCAL,
    ...appConfig.allowedCorsDomains.STAGING,
    ...appConfig.allowedCorsDomains.TESTING,
    ...appConfig.allowedCorsDomains.PRODUCTION,
  ].join('|')})${'(:\\d{4,5})?'}$`,
)

// No protection needed for these routes
const UNPROTECTED_ROUTES = [
  '/api/healthz',
  '/api/version',
  '/api/assets/*',
  '/api/functions/*',
  '/trpc/*',
  '/auth/email/verify',
  '/auth/password/reset',
  '/jwks/keys.json',
  '/_/*',
]

const matchRoute = (pathname: string, patterns: string[]) => {
  return patterns.some((p) =>
    p.endsWith('/*') ? pathname.startsWith(p.slice(0, -2)) : pathname === p,
  )
}

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname
  const requestOrigin = getRequestHeader(event, 'origin')

  // Skip protection for these routes
  if (
    !pathname.startsWith('/api') ||
    !pathname.startsWith('/trpc') ||
    !pathname.startsWith('/_/')
  ) {
    return
  }

  // Get request information
  const { userAgentHash } = getClientInfo(event)
  const apiKey = getHeader(event, 'X-API-Key')
  const origin = requestOrigin || 'same-origin'
  const method = event.method
  const { db } = event.context

  const apiPath = pathname.replace('/api', '')
  const requestId = typeid('req').toString()

  // Only protect POST, PUT, PATCH, DELETE requests
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return
  if (matchRoute(apiPath, UNPROTECTED_ROUTES)) return

  // Log incoming request
  logger.debug('[cors]', JSON.stringify({ pathname, origin, method, userAgentHash }, null, 1))

  const didHandleCors = handleCors(event, {
    preflight: { statusCode: 204 },
    origin(requestOrigin) {
      // Izinkan same-origin requests
      if (!requestOrigin) {
        logger.debug('[cors]', 'Allowing same-origin request')
        return true
      }

      // Validasi origin menggunakan RegExp
      const isAllowed = ALLOWED_ORIGIN_PATTERN.test(requestOrigin)

      if (!isAllowed) {
        logger.warn('[cors]', `Blocked request from unauthorized origin: ${requestOrigin}`)
      } else {
        logger.debug('[cors]', `Allowed request from: ${requestOrigin}`)
      }

      return isAllowed
    },
    credentials: true, // Allow support for credentials (cookies, auth headers)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Client-Info'],
    exposeHeaders: ['Content-Length', 'Content-Type'],
  })

  if (didHandleCors) {
    return
  }

  // Browser-based official app - validate CSRF token
  const csrfToken = getCookie(event, 'csrf_token')
  const headerToken = getHeader(event, 'X-CSRF-Token')

  logger.debug('[csrf]', JSON.stringify({ csrfToken, headerToken }))

  if (!headerToken) {
    return createErrorResponse(event, 'Missing CSRF token', 403)
  }

  if (!csrfToken || !validateCSRFToken(csrfToken)) {
    return createErrorResponse(event, 'Invalid or expired CSRF token', 403)
  }

  if (!compareCSRFTokens(headerToken, csrfToken)) {
    return createErrorResponse(event, 'CSRF token mismatch', 403)
  }

  try {
    const isValidKey = await validateApiKey(db, apiKey || '')
    logger.debug('[csrf]', JSON.stringify({ apiKey, isValidKey }))
  } catch (error) {
    await auditLog(event, {
      action: 'login',
      entity: 'user',
      entityId: 'anonymous',
      metadata: {
        success: false,
        requestId,
        reason: error instanceof ApiKeyValidationError ? error.message : 'invalid_api_key',
      },
      retention: 'COMPLIANCE',
    })
    const errMsg = error instanceof ApiKeyValidationError ? error.message : 'Invalid API key'
    return createErrorResponse(event, errMsg, 401)
  }
  return
})
