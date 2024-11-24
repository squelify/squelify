import { existsSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { parse, resolve } from 'node:path'
import { createError, defineEventHandler } from 'h3'
import { createRouter } from 'radix3'
import { createRateLimit, getRateLimitInfo } from '~/database/repository/rate_limit.repo'
import { DURATION } from '~/utils/datetime'
import { getClientInfo } from '~/utils/http'

// TODO: Add TypeScript support for functions
const ALLOWED_EXTENSIONS = ['.mjs', '.js']
const FUNCTION_TIMEOUT = DURATION.SECOND * 10

// Rate limits for functions
const FUNCTION_RATE_LIMITS = {
  ip: { points: 100, window: DURATION.MINUTE * 5 }, // 100 requests per 5 minutes
  user: { points: 200, window: DURATION.MINUTE * 15 }, // 200 requests per 15 minutes
}

// TODO: migrate to `rou3` in the future
// Create router instance
const router = createRouter({
  strictTrailingSlash: true,
})

export default defineEventHandler(async (event) => {
  const url = event.path
  const functionName = url.replace('/api/functions/', '')
  const { db } = event.context
  const { clientIpAddress } = getClientInfo(event)
  const userId = event.context.auth?.payload?.sub

  try {
    // Rate limit checks
    const ipLimitInfo = await getRateLimitInfo(db, clientIpAddress, 'ip')
    if (ipLimitInfo.isLimited) {
      const waitMinutes = Math.ceil((ipLimitInfo.resetAt - Math.floor(Date.now() / 1000)) / 60)
      throw createError({
        statusCode: 429,
        message: `Too many requests. Please try again in ${waitMinutes} minute(s)`,
      })
    }

    if (userId) {
      const userLimitInfo = await getRateLimitInfo(db, userId, 'user')
      if (userLimitInfo.isLimited) {
        const waitMinutes = Math.ceil((userLimitInfo.resetAt - Math.floor(Date.now() / 1000)) / 60)
        throw createError({
          statusCode: 429,
          message: `Too many requests. Please try again in ${waitMinutes} minutes`,
        })
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

    const files = await readdir(functionsDir)
    if (files.length === 0) {
      logger.info('[functions]', 'No user functions files found')
      return
    }

    // Register routes for each function file
    for (const file of files) {
      const { name, ext } = parse(file)
      if (ALLOWED_EXTENSIONS.includes(ext)) {
        const [baseName, method = 'get'] = name.split('.')
        const path = `/api/functions/${baseName}`

        router.insert(path, {
          method: method.toLowerCase(),
          handler: async () => {
            const userFunction = await import(`${functionsDir}/${file}`)
            return userFunction.default
          },
        })
      }
    }

    // Match route
    const match = router.lookup(url)
    if (!match) {
      throw createError({
        statusCode: 404,
        message: `Function ${functionName} not found`,
      })
    }

    // Validate HTTP method
    if (match.method !== event.method.toLowerCase()) {
      throw createError({
        statusCode: 405,
        message: `Method ${event.method} not allowed for function ${functionName}`,
      })
    }

    const handler = await match.handler()
    return await executeFunction(handler, event)
  } catch (error) {
    logger.error('[functions]', error)
    throw error
  }
})

async function executeFunction(fn: Function, event: any) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Function timeout')), FUNCTION_TIMEOUT * 1000)
  })

  return Promise.race([fn(event), timeoutPromise])
}
