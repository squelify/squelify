import { typeid } from 'typeid-js'
import { ApiKeyValidationError, validateApiKey } from '~/database/repository/api_key.repo'
import { validateCSRFToken } from '~/utils/string'

// No protection needed
const PUBLIC_ROUTES = [
  '/api/healthz',
  '/api/version',
  '/api-docs',
  '/api-specs.json',
  '/api/assets/*',
  '/api/functions/*',
  '/setup',
]

// No CSRF/API key needed
const UNPROTECTED_ROUTES = [
  // '/auth/login',
  // '/auth/signup',
  '/auth/email/verify',
  '/auth/password/reset',
  '/jwks/keys.json',
]

const matchRoute = (pathname: string, patterns: string[]) => {
  return patterns.some((p) =>
    p.endsWith('/*') ? pathname.startsWith(p.slice(0, -2)) : pathname === p
  )
}

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname
  const requestId = typeid('req').toString()

  const method = event.method
  const { db } = event.context

  // Only protect POST, PUT, PATCH, DELETE requests
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return
  if (matchRoute(pathname, PUBLIC_ROUTES)) return

  try {
    const apiPath = pathname.replace('/api', '')
    const apiKey = getHeader(event, 'X-API-Key')
    const clientInfo = getHeader(event, 'X-Client-Info')
    const isOfficialApp = clientInfo?.startsWith('ApiClient')

    if (matchRoute(apiPath, UNPROTECTED_ROUTES)) return

    if (isOfficialApp) {
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
    } else {
      // External API integration using API key
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
            clientInfo,
          },
          retention: 'COMPLIANCE',
        })
        const errMsg = error instanceof ApiKeyValidationError ? error.message : 'Invalid API key'
        return createErrorResponse(event, errMsg, 401)
      }
      return
    }
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
