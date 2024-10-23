import { LibsqlError } from '@libsql/client'
import { NoResultError } from 'kysely'
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
export function createErrorResponse(statusCode: number, error: string, details?: ErrorDetails) {
  return { statusCode, error, ...details }
}

export function throwErrorResponse(error: Error, statusCode?: number) {
  // Handle connection errors
  if ('code' in error && error.code === 'ECONNREFUSED') {
    return {
      statusCode: 503,
      message: 'Database service is currently unavailable',
    }
  }

  // Handle LibSQL errors
  if (error instanceof LibsqlError) {
    return {
      statusCode,
      message: `Database error ${error.code}: ${error.message}`,
    }
  }

  // Handle Kysely errors
  if (error instanceof NoResultError) {
    return {
      statusCode,
      message: `Query error: ${error.message}`,
    }
  }

  if (error instanceof z.ZodError) {
    return createErrorResponse(400, 'Invalid request', {
      issues: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  // Handle unknown errors
  return {
    statusCode: statusCode || 500,
    message: error.message || 'An unexpected error occurred',
  }
}
