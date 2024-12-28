import { H3Error, type H3Event } from 'h3'
import { sha256base64 } from 'ohash'
import { isDevelopment } from 'std-env'
import { UAParser } from 'ua-parser-js'
import { z } from 'zod'

export interface ApiResponse<T = unknown> {
  status: number
  success: boolean
  message: string | null
  data?: T
  error?: {
    issues?: Array<{ field: string; message: string }>
    stack?: string
  }
}

export function createSuccessResponse<T>(
  event: H3Event,
  message: string | null = null,
  data?: T,
  status = 200
): ApiResponse<T> {
  setResponseStatus(event, status)
  return { status, success: true, message, ...(data && { data }) }
}

export function createErrorResponse(
  event: H3Event,
  message: string,
  status: number,
  error?: {
    issues?: Array<{ field: string; message: string }>
    stack?: string
  }
): ApiResponse {
  setResponseStatus(event, status)
  return { status, success: false, message, error }
}

export function throwErrorResponse(event: H3Event, error: unknown) {
  if (isErrorResponse(error)) {
    return error
  }

  if (error instanceof H3Error && error.data) {
    return createErrorResponse(event, error.message, error.statusCode, {
      issues: error.data.issues,
      ...(isDevelopment && { stack: error.stack }),
    })
  }

  const err = error as Error
  return createErrorResponse(
    event,
    err.message || 'Internal server error',
    500,
    isDevelopment ? { stack: err.stack } : undefined
  )
}

/**
 * Type guard for error response format
 */
function isErrorResponse(error: unknown): error is {
  status: number
  success: boolean
  message: string
  data?: any
} {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'success' in error &&
    'message' in error
  )
}

/**
 * Validates request body against a Zod schema and returns the parsed data
 * @param event H3Event from Nitro
 * @param schema Zod schema for validation
 * @returns Parsed and validated data
 */
export async function requireValidatedBody<T extends z.ZodType>(
  event: H3Event,
  schema: T
): Promise<z.infer<T>> {
  const body = await readValidatedBody(event, (body) => schema.safeParse(body))

  if (!body.success) {
    setResponseStatus(event, 400)
    throw createError({
      statusCode: 400,
      data: {
        issues: body.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
      message: 'Invalid request',
    })
  }

  return body.data
}

export function getClientInfo(event: H3Event) {
  const clientIpAddress = getRequestIP(event, { xForwardedFor: true }) || ''
  const clientInfo = event.headers.get('X-Client-Info') || ''
  const userAgent = event.headers.get('User-Agent') || ''
  const userAgentHash = sha256base64(userAgent)

  let clientIdentifier = userAgent

  if (clientInfo) {
    clientIdentifier = `[${clientInfo}]`
  } else if (userAgent) {
    const uaParser = new UAParser(userAgent)
    // Check if browser info exists
    if (uaParser.getBrowser().name) {
      const clientOS = `${uaParser.getOS().name} ${uaParser.getOS().version}`
      const browserInfo = `${uaParser.getBrowser().name} ${uaParser.getBrowser().version}`
      clientIdentifier = `[${clientOS} ${browserInfo}]`
    }
  }

  return { clientIpAddress, clientIdentifier, userAgent, userAgentHash }
}
