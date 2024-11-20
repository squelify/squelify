import { typeid } from 'typeid-js'
import { validateApiKey } from '~/database/repository/api_key.repo'
import { validateCSRFToken } from '~/utils/string'

const PROTECTED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']

// No protection needed
const PUBLIC_ROUTES = [
  '/api/healthz',
  '/api/version',
  '/api-docs',
  '/api-specs.json',
  '/api/assets/*',
]

// No CSRF/API key needed
const UNPROTECTED_ROUTES = [
  // '/auth/login',
  // '/auth/signup',
  '/auth/email/verify',
  '/auth/password/reset',
  '/jwks/keys.json',
]

const matchRoute = (pathname: string, patterns: string[]) =>
  patterns.some((p) => (p.endsWith('/*') ? pathname.startsWith(p.slice(0, -2)) : pathname === p))

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname
  const requestId = typeid('req').toString()

  const method = event.method
  const { db } = event.context

  if (!PROTECTED_METHODS.includes(method)) return
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

      logger.debug('[midw]', 'CSRF validation', JSON.stringify({ csrfToken, headerToken }))

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
      const isValidKey = await validateApiKey(db, apiKey)
      if (!apiKey || !isValidKey) {
        await auditLog(event, {
          action: 'login',
          entity: 'user',
          entityId: 'anonymous',
          metadata: {
            success: false,
            requestId,
            reason: 'invalid_api_key',
            clientInfo,
          },
          retention: 'COMPLIANCE',
        })
        return createErrorResponse(event, 'Invalid API key', 401)
      }
      return
    }
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
