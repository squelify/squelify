import { H3Event } from 'h3'
import { env } from 'std-env'
import { createRateLimit, getRateLimitInfo } from '~/database/repository/rate_limit.repo'

// Default rate limit configuration
const DEFAULT_RATE_LIMITS = {
  ip: { points: 100, window: 300 }, // 100 requests per 5 minutes
  user: { points: 200, window: 900 }, // 200 requests per 15 minutes
}

// Custom rate limits per endpoint
const ENDPOINT_RATE_LIMITS: Record<string, typeof DEFAULT_RATE_LIMITS | false> = {
  // Disable rate limiting
  '/api/auth/refresh': false,

  // Soft rate limits for login
  '/api/auth/login': {
    ip: { points: 20, window: 300 }, // 20 attempts per 5 minutes
    user: { points: 30, window: 900 }, // 30 attempts per 15 minutes
  },

  // Stricter limits for signup
  '/api/auth/signup': {
    ip: { points: 3, window: 1800 }, // 3 attempts per 30 minutes
    user: { points: 5, window: 3600 }, // 5 attempts per hour
  },
}

// Paths to exclude from rate limiting
const EXCLUDED_PATHS = ['/api/healthz', '/api/settings']

export default defineEventHandler(async (event) => {
  // Skip rate limiting if disabled globally via environment variable
  if (env.RATE_LIMIT_ENABLE === 'false' || !env.RATE_LIMIT_ENABLE) {
    return
  }

  const { db } = event.context
  const pathname = getRequestURL(event).pathname

  // Skip rate limiting for excluded paths
  if (EXCLUDED_PATHS.some((path) => pathname.startsWith(path))) {
    return
  }

  const { clientIpAddress } = getClientInfo(event)
  const userId = event.context.auth?.payload?.sub
  const userEmail = event.context.auth?.payload?.email

  // Get rate limit config for this endpoint
  const rateLimits = ENDPOINT_RATE_LIMITS[pathname]
  if (rateLimits === false) {
    return // Skip rate limiting for this endpoint
  }

  try {
    // Check IP-based rate limit
    const ipLimitInfo = await getRateLimitInfo(db, clientIpAddress, 'ip')
    if (ipLimitInfo.isLimited) {
      const waitMinutes = Math.ceil((ipLimitInfo.resetAt - Math.floor(Date.now() / 1000)) / 60)
      setResponseStatus(event, 429)
      return createErrorResponse(
        429,
        `Terlalu banyak request. Silakan coba lagi dalam ${waitMinutes} menit.`
      )
    }

    // For auth endpoints, check email from request body
    if (pathname.startsWith('/api/auth')) {
      const body = await readBody(event)
      const email = body?.identity || body?.email

      if (email) {
        const emailLimitInfo = await getRateLimitInfo(db, email, 'email')
        if (emailLimitInfo.isLimited) {
          const waitMinutes = Math.ceil(
            (emailLimitInfo.resetAt - Math.floor(Date.now() / 1000)) / 60
          )
          setResponseStatus(event, 429)
          return createErrorResponse(
            429,
            `Terlalu banyak request untuk email ini. Silakan coba lagi dalam ${waitMinutes} menit.`
          )
        }
        await createRateLimit(db, email, 'email', rateLimits.user.points, rateLimits.user.window)
      }
    }
    // For authenticated routes, use user ID and email from auth context
    else if (userId && userEmail) {
      const userLimitInfo = await getRateLimitInfo(db, userId, 'user')
      if (userLimitInfo.isLimited) {
        const waitMinutes = Math.ceil((userLimitInfo.resetAt - Math.floor(Date.now() / 1000)) / 60)
        setResponseStatus(event, 429)
        return createErrorResponse(
          429,
          `Terlalu banyak request. Silakan coba lagi dalam ${waitMinutes} menit.`
        )
      }
      await createRateLimit(db, userId, 'user', rateLimits.user.points, rateLimits.user.window)
    }

    // Track IP-based rate limit
    await createRateLimit(db, clientIpAddress, 'ip', rateLimits.ip.points, rateLimits.ip.window)
  } catch (error) {
    logger.error('[RateLimit] Middleware error:', error)
  }
})
