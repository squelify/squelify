import { existsSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { parse, resolve } from 'node:path'
import { createError, defineEventHandler } from 'h3'
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

export default defineEventHandler(async (event) => {
  const url = event.path
  const functionName = url.replace('/api/functions/', '')
  const { db } = event.context
  const { clientIpAddress } = getClientInfo(event)
  const userId = event.context.auth?.payload?.sub

  try {
    // Check IP-based rate limit
    const ipLimitInfo = await getRateLimitInfo(db, clientIpAddress, 'ip')
    if (ipLimitInfo.isLimited) {
      const waitMinutes = Math.ceil((ipLimitInfo.resetAt - Math.floor(Date.now() / 1000)) / 60)
      throw createError({
        statusCode: 429,
        message: `Too many requests. Please try again in ${waitMinutes} minute(s)`,
      })
    }

    // Check user-based rate limit if authenticated
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
        'functions',
        FUNCTION_RATE_LIMITS.user.points,
        FUNCTION_RATE_LIMITS.user.window
      )
    }

    // Track IP-based rate limit
    await createRateLimit(
      db,
      clientIpAddress,
      'ip',
      FUNCTION_RATE_LIMITS.ip.points,
      FUNCTION_RATE_LIMITS.ip.window
    )

    // Rest of the function handler code...
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

    const functionFile = files.find((file) => {
      const { name, ext } = parse(file)
      return name === functionName && ALLOWED_EXTENSIONS.includes(ext)
    })

    if (!functionFile) {
      throw createError({
        statusCode: 404,
        message: `Function ${functionName} not found`,
      })
    }

    try {
      const userFunction = await import(`${functionsDir}/${functionFile}`)
      return await executeFunction(userFunction.default, event)
    } catch (error) {
      throw createError({
        statusCode: 500,
        message: `Error executing function: ${error.message}`,
      })
    }
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
