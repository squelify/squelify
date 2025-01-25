import { existsSync } from 'node:fs'
import { globby } from 'globby'
import { createError, defineEventHandler, setCookie } from 'h3'
import { getCookie, getHeaders, getQuery, readBody } from 'h3'
import { parse, resolve } from 'pathe'
import { createRouter } from 'radix3'
import { libSQLClient } from '~/database/db.client'
import { createRateLimit, getRateLimitInfo } from '~/database/repository/rate_limit.repo'
import { DURATION } from '~/utils/datetime'
import { createErrorResponse, createSuccessResponse, getClientInfo } from '~/utils/http'

const FUNCTION_TIMEOUT = 30 * 1000 // 30 seconds (in milliseconds)
const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const
type HttpMethod = (typeof HTTP_METHODS)[number]

const FUNCTION_RATE_LIMITS = {
  ip: { points: 100, window: DURATION.MINUTE * 5 },
  user: { points: 200, window: DURATION.MINUTE * 15 },
}

interface RouteHandler {
  method: HttpMethod
  filePath: string
  handler: () => Promise<Function>
}

// FIXME: Wildcard routes still not working
const router = createRouter<RouteHandler>({
  strictTrailingSlash: true,
})

function parseFileName(fileName: string): { routeName: string; method: HttpMethod } {
  const { name, dir } = parse(fileName)
  const parts = name.split('.')

  // Handle wildcards first
  if (parts.includes('[...]')) {
    return {
      routeName: `${dir ? `${dir}/` : ''}*`,
      method:
        (parts
          .find((part) => HTTP_METHODS.includes(part.toLowerCase() as HttpMethod))
          ?.toLowerCase() as HttpMethod) || 'get',
    }
  }

  // Handle index files
  if (parts[0] === 'index') {
    return {
      routeName: dir || '',
      method:
        (parts
          .find((part) => HTTP_METHODS.includes(part.toLowerCase() as HttpMethod))
          ?.toLowerCase() as HttpMethod) || 'get',
    }
  }

  // Find method part if exists
  const methodPart = parts.find((part) => HTTP_METHODS.includes(part.toLowerCase() as HttpMethod))

  // Handle wildcards and parameters
  const routeParts = parts.map((part) => {
    if (part === '[...]') {
      return '*'
    }
    if (part.startsWith('[') && part.endsWith(']')) {
      return `:${part.slice(1, -1)}`
    }
    return part
  })

  // Build route name without method part
  const cleanParts = routeParts.filter((part) => part.toLowerCase() !== methodPart?.toLowerCase())
  const routeName = dir ? `${dir}/${cleanParts[0]}` : cleanParts[0]

  return {
    routeName,
    method: (methodPart?.toLowerCase() as HttpMethod) || 'get',
  }
}

export default defineEventHandler(async (event) => {
  const url = event.path
  const { db } = event.context
  const { clientIpAddress } = getClientInfo(event)
  const userId = event.context.auth?.payload?.sub
  const requestMethod = event.method.toLowerCase()

  try {
    // Rate limit checks
    const ipLimitInfo = await getRateLimitInfo(db, clientIpAddress, 'ip')
    if (ipLimitInfo.isLimited) {
      const waitMinutes = Math.ceil((ipLimitInfo.resetAt - Math.floor(Date.now() / 1000)) / 60)
      return createErrorResponse(
        event,
        `Too many requests. Please try again in ${waitMinutes} minute(s)`,
        429
      )
    }

    if (userId) {
      const userLimitInfo = await getRateLimitInfo(db, userId, 'user')
      if (userLimitInfo.isLimited) {
        const waitMinutes = Math.ceil((userLimitInfo.resetAt - Math.floor(Date.now() / 1000)) / 60)
        return createErrorResponse(
          event,
          `Too many requests. Please try again in ${waitMinutes} minutes`,
          429
        )
      }
      await createRateLimit(
        db,
        userId,
        'user',
        FUNCTION_RATE_LIMITS.user.points,
        FUNCTION_RATE_LIMITS.user.window
      )
    }

    await createRateLimit(
      db,
      clientIpAddress,
      'ip',
      FUNCTION_RATE_LIMITS.ip.points,
      FUNCTION_RATE_LIMITS.ip.window
    )

    const functionsDir = resolve(process.cwd(), '_data/functions')
    if (!existsSync(functionsDir)) {
      logger.info('[functions]', 'No user functions folder found')
      return
    }

    // Read all files in the functions directory
    // Only read files with .js or .mjs extensions
    const files = await globby('**/*.{mjs,js}', {
      onlyFiles: true,
      cwd: functionsDir,
    })

    if (files.length === 0) {
      logger.info('[functions]', 'No user functions files found')
      return
    }

    // Register routes
    for (const file of files) {
      const { routeName, method } = parseFileName(file)
      const routePath = `/api/functions/${routeName}`.replace(/\/+/g, '/').replace(/\/$/, '')

      router.insert(routePath, {
        method,
        filePath: file,
        handler: async () => {
          logger.debug('[functions:load]', `Loading: ${file} for ${method} ${routePath}`)
          const userFunction = await import(`${functionsDir}/${file}`)
          const handler = userFunction.default || userFunction

          // Inject h3 utilities into the handler
          return async (event: any) => {
            event.h3 = {
              getQuery,
              getHeaders,
              readBody: async () => {
                if (!['post', 'put', 'patch'].includes(event.method.toLowerCase())) {
                  const errMessage = `Method ${event.method} does not support request body`
                  return createErrorResponse(event, errMessage, 405)
                }
                return readBody(event)
              },
              setCookie,
              getCookie,
              createError,
              // TODO: protect against malicious user functions especially for the database access
              createSuccessResponse, // Return API success response
              createErrorResponse, // Return API error response
              db: libSQLClient, // Inject database client
            }
            return handler(event)
          }
        },
      })

      logger.debug('[functions:route]', `${method.toUpperCase()} ${routePath} -> ${file}`)
    }

    // Match route
    const match = router.lookup(url.split('?')[0])
    logger.debug(
      '[functions:match]',
      JSON.stringify({
        url: url.split('?')[0],
        found: !!match,
        method: match?.method,
        params: match?.params,
      })
    )

    if (!match) {
      return createErrorResponse(event, `Function not found: ${url}`, 404)
    }

    // Validate HTTP method
    if (match.method !== requestMethod) {
      return createErrorResponse(
        event,
        `Method ${requestMethod.toUpperCase()} not allowed for this function`,
        405
      )
    }

    const handler = await match.handler()
    return await executeFunction(handler, event)
  } catch (error) {
    logger.error('[functions]', error)
    throw error
  }
})

async function executeFunction(fn: Function, event: any) {
  const match = router.lookup(event.path.split('?')[0])
  if (match?.params) {
    if (match.params['*']) {
      // Make sure wildcard paths are processed correctly
      const wildcardPath = decodeURIComponent(match.params['*'])
      event.context.params = {
        ...match.params,
        '*': wildcardPath.split('/').filter(Boolean),
      }
    } else {
      event.context.params = match.params
    }
  }

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Function timeout')), FUNCTION_TIMEOUT)
  })

  return Promise.race([fn(event), timeoutPromise])
}
