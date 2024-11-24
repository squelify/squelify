import { existsSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { defineEventHandler } from 'h3'
import { parse, relative, resolve } from 'pathe'
import { createRouter } from 'radix3'
import { createRateLimit, getRateLimitInfo } from '~/database/repository/rate_limit.repo'
import { DURATION } from '~/utils/datetime'
import { createErrorResponse, getClientInfo } from '~/utils/http'

const ALLOWED_EXTENSIONS = ['.mjs', '.js']
const FUNCTION_TIMEOUT = DURATION.SECOND * 10
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

const router = createRouter<RouteHandler>({
  strictTrailingSlash: true,
})

function parseFileName(fileName: string): { routeName: string; method: HttpMethod } {
  const { name, dir } = parse(fileName)
  const parts = name.split('.')

  // Handle index files
  if (name === 'index' || parts[0] === 'index') {
    return {
      routeName: dir || '', // Use directory name or empty for root
      method:
        (parts
          .find((part) => HTTP_METHODS.includes(part.toLowerCase() as HttpMethod))
          ?.toLowerCase() as HttpMethod) || 'get',
    }
  }

  // Find method part if exists
  const methodPart = parts.find((part) => HTTP_METHODS.includes(part.toLowerCase() as HttpMethod))

  if (methodPart) {
    // Remove method from route name
    const routeParts = parts.filter((part) => part.toLowerCase() !== methodPart.toLowerCase())
    return {
      routeName: `${dir}/${routeParts[0]}`,
      method: methodPart.toLowerCase() as HttpMethod,
    }
  }

  // No method in filename, use full name as route and default to GET
  return {
    routeName: `${dir}/${name}`,
    method: 'get',
  }
}

async function scanFunctionsDir(dir: string, baseDir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name)
    const relativePath = relative(baseDir, fullPath)

    if (entry.isDirectory()) {
      const subFiles = await scanFunctionsDir(fullPath, baseDir)
      files.push(...subFiles)
    } else {
      // Skip files in root directory
      if (!relativePath.includes('/')) {
        continue
      }

      const { ext } = parse(entry.name)
      if (ALLOWED_EXTENSIONS.includes(ext)) {
        files.push(relativePath)
        logger.debug('[functions]', `Found function: ${relativePath}`)
      }
    }
  }

  return files
}

export default defineEventHandler(async (event) => {
  const url = event.path
  const { db } = event.context
  const { clientIpAddress } = getClientInfo(event)
  const userId = event.context.auth?.payload?.sub
  const requestMethod = event.method.toLowerCase()

  try {
    // Rate limit checks...
    const ipLimitInfo = await getRateLimitInfo(db, clientIpAddress, 'ip')
    if (ipLimitInfo.isLimited) {
      const waitMinutes = Math.ceil((ipLimitInfo.resetAt - Math.floor(Date.now() / 1000)) / 60)
      const errMessage = `Too many requests. Please try again in ${waitMinutes} minute(s)`
      return createErrorResponse(event, errMessage, 429)
    }

    if (userId) {
      const userLimitInfo = await getRateLimitInfo(db, userId, 'user')
      if (userLimitInfo.isLimited) {
        const waitMinutes = Math.ceil((userLimitInfo.resetAt - Math.floor(Date.now() / 1000)) / 60)
        const errMessage = `Too many requests. Please try again in ${waitMinutes} minutes`
        return createErrorResponse(event, errMessage, 429)
      }
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

    const files = await scanFunctionsDir(functionsDir, functionsDir)
    if (files.length === 0) {
      logger.info('[functions]', 'No user functions files found')
      return
    }

    // Register routes
    for (const file of files) {
      const { routeName, method } = parseFileName(file)

      // Build clean route path
      const routePath = `/api/functions/${routeName}`.replace(/\/+/g, '/').replace(/\/$/, '')

      router.insert(routePath, {
        method,
        filePath: file,
        handler: async () => {
          const userFunction = await import(`${functionsDir}/${file}`)
          return userFunction.default
        },
      })

      logger.debug('[functions]', `Registered route: ${method.toUpperCase()} ${routePath}`)
    }

    // Match route
    const match = router.lookup(url)
    if (!match) {
      return createErrorResponse(event, `Function not found: ${url}`, 404)
    }

    // Validate HTTP method
    if (match.method !== requestMethod) {
      const errMessage = `Method ${requestMethod.toUpperCase()} not allowed for this function`
      return createErrorResponse(event, errMessage, 404)
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
