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
export function createErrorResponse(statusCode: number, error: string, details: ErrorDetails) {
  return { statusCode, error, ...details }
}
