// Domain configurations
const DOMAINS = {
  LOCAL: ['localhost', '127.0.0.1'],
  STAGING: ['staging.example.com'],
  TESTING: ['testing.example.com'],
  PRODUCTION: ['example.com', 'app.example.com'],
}

// Protocol and port configurations
const PROTOCOLS = ['http', 'https']
const PORT_PATTERN = '(:\\d{4,5})?'

// Build allowed origins pattern
const ALLOWED_ORIGIN_PATTERN = new RegExp(
  `^(${PROTOCOLS.join('|')}):\\/\\/(${[
    ...DOMAINS.LOCAL,
    ...DOMAINS.STAGING,
    ...DOMAINS.TESTING,
    ...DOMAINS.PRODUCTION,
  ].join('|')})${PORT_PATTERN}$`
)

export default defineEventHandler((event) => {
  const pathname = getRequestURL(event).pathname
  const requestOrigin = getRequestHeader(event, 'origin')

  const isApiDocsRoute = event.path.startsWith('/api-docs') || event.path !== '/api-specs.json'

  // Skip CORS handling untuk path non-API
  if (!pathname.startsWith('/api') || !isApiDocsRoute) {
    return
  }

  // Get request information
  const { userAgentHash } = getClientInfo(event)
  const origin = requestOrigin || 'same-origin'
  const method = event.method

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
    credentials: true, // Support untuk credentials (cookies, auth headers)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Client-Info'],
    exposeHeaders: ['Content-Length', 'Content-Type'],
  })

  if (didHandleCors) {
    return
  }
})
