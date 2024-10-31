import { H3Error, type H3Event } from 'h3'
import { sha256base64 } from 'ohash'
import { isProduction } from 'std-env'
import { UAParser } from 'ua-parser-js'
import { z } from 'zod'

interface ErrorDetails {
  issues?: Array<{ field: string; message: string }>
  message?: string
}

/**
 * Creates an error response object with the specified status code, error message, and optional error details.
 *
 * @param statusCode - The HTTP status code for the error response.
 * @param error - The error message.
 * @param details - Optional additional error details, including a list of issues with field and message properties.
 * @returns An object with the status code, error message, and optional error details.
 */
export function createErrorResponse(statusCode: number, message: string, details?: ErrorDetails) {
  return { status: statusCode, success: false, message, ...details }
}

/**
 * Standardized error response handler
 */
export function throwErrorResponse(error: unknown) {
  // If error already in correct format, return as is
  if (isErrorResponse(error)) {
    return error
  }

  // Handle H3Error with data property
  if (error instanceof H3Error && error.data) {
    return {
      status: error.statusCode,
      success: false,
      message: error.message,
      data: error.data,
    }
  }

  // Handle known errors with status code
  if (error instanceof Error && 'statusCode' in error) {
    return createErrorResponse((error as any).statusCode || 500, error.message)
  }

  // Default error response
  const err = error as Error
  return createErrorResponse(
    500,
    err.message || 'Internal server error',
    !isProduction ? { message: err.message } : undefined
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
  const clientIpAddress = getRequestIP(event, { xForwardedFor: true })
  const clientInfo = event.headers.get('X-Client-Info')
  const userAgent = event.headers.get('User-Agent')
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
