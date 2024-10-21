import Redactyl from 'redactyl.js'
import { env } from 'std-env'

/**
 * Defines the log level for the application.
 * The log level is determined by the environment variable. If the environment is production,
 * the log level is set to `info`. Otherwise, the log level is set to verbose `debug`.
 *
 * Available log levels (from least to most verbose):
 * 1. 'silent': Suppresses all logging output
 * 2. 'error': Error messages that indicate a problem in the application
 * 3. 'warn': Warning messages that don't affect the application's operation
 * 4. 'info': Standard informational messages
 * 5. 'query': Database query logging for debugging database queries
 * 6. 'debug': Detailed debug information for development purposes (censored sensitive information)
 * 7. 'trace': Very detailed tracing information (sensitive information may be included)
 */
export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'query' | 'debug' | 'trace'

/**
 * An object containing functions that apply ANSI color escape codes to a given text string.
 * These functions can be used to colorize console output.
 */
const colors = {
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  dim: (text: string) => `\x1b[2m${text}\x1b[0m`,
  gray: (text: string) => `\x1b[90m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  magenta: (text: string) => `\x1b[35m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
}

// Instantiate Redactyl with sensitive fields to redact
const redactyl = new Redactyl({
  properties: ['apiKey', 'password', 'phone', 'email', 'token', 'secret', 'creditCard'],
  text: '[REDACTED]',
})

/**
 * Generates a formatted timestamp string.
 * @param date - Optional Date object. Defaults to current date/time.
 * @param localtime - Whether to use local time. Defaults to true.
 * @returns Formatted timestamp string.
 */
function logTimestamp(date?: Date, localtime = env.TZ !== 'UTC'): string {
  const now = date ?? new Date()
  const useUTC = !localtime

  const year = useUTC ? now.getUTCFullYear() : now.getFullYear()
  const month = String(useUTC ? now.getUTCMonth() + 1 : now.getMonth() + 1).padStart(2, '0')
  const day = String(useUTC ? now.getUTCDate() : now.getDate()).padStart(2, '0')
  const hours = String(useUTC ? now.getUTCHours() : now.getHours()).padStart(2, '0')
  const minutes = String(useUTC ? now.getUTCMinutes() : now.getMinutes()).padStart(2, '0')
  const seconds = String(useUTC ? now.getUTCSeconds() : now.getSeconds()).padStart(2, '0')

  return colors.dim(`[${year}-${month}-${day} ${hours}:${minutes}:${seconds}]`)
}

// Constants for log colors
const LOG_COLORS: Record<Exclude<LogLevel, 'silent'>, (text: string) => string> = {
  debug: colors.magenta,
  error: colors.red,
  info: colors.green,
  query: colors.blue,
  trace: colors.cyan,
  warn: colors.yellow,
}

// Constants for log methods with uppercase keys
const LOG_METHODS: Record<string, (...args: unknown[]) => void> = {
  DEBUG: console.log,
  ERROR: console.error,
  INFO: console.info,
  QUERY: console.log,
  TRACE: console.debug,
  WARN: console.warn,
}

// Fallback constants
const DEFAULT_COLOR = colors.gray
const DEFAULT_LOG_METHOD = console.log
const LOG_LEVELS = Object.keys(LOG_METHODS)
const MAX_LEVEL_LENGTH = Math.max(...LOG_LEVELS.map((level) => level.length))

// Helper function to strip newlines, tabs, and 4 spaces from string content
const stripNewLinesAndSpaces = (content: unknown) =>
  typeof content === 'string' &&
  (content.includes('\n') || content.includes('\t') || content.includes('    '))
    ? content
        .replace(/\r?\n|\r/g, '')
        .replace(/\t/g, '')
        .replace(/ {4}/g, '')
    : content

// Helper function to process and clean the message
const processMessage = (message: unknown) => {
  if (typeof message === 'object') {
    return JSON.stringify(message)
  }
  if (
    typeof message === 'string' &&
    message.trim().startsWith('{') &&
    message.trim().endsWith('}')
  ) {
    return message // Already in JSON string format
  }
  return stripNewLinesAndSpaces(message)
}

// Helper function to log errors, redacted for 'debug' and full for 'trace'
const handleErrorLogging = (
  level: string,
  message: Error,
  logPrefix: string,
  logFunc: (...args: unknown[]) => void
) => {
  const errorObj = {
    name: message.name,
    message: message.message,
    stack: message.stack,
  }
  if (level === 'debug') {
    const redactedError = redactyl.redact<any>(errorObj)
    logFunc(logPrefix, JSON.stringify(redactedError, null, 2))
  } else if (level === 'trace') {
    logFunc(logPrefix, JSON.stringify(errorObj, null, 2))
  }
}

/**
 * Logs a message with the specified log level.
 * @param level - The log level.
 * @param message - The message to log.
 * @param args - Additional arguments to log.
 */
function log(
  level: Exclude<LogLevel, 'silent'>,
  message: string | unknown,
  ...args: unknown[]
): void {
  // Determine log color and method
  const colorFunc = LOG_COLORS[level] || DEFAULT_COLOR
  const logFunc = LOG_METHODS[level.toUpperCase()] || DEFAULT_LOG_METHOD

  // Clean and process the message
  const cleanedMessage = processMessage(message)

  // Apply redaction for all levels except trace
  const filteredMessage = level !== 'trace' ? redactyl.redact<any>(cleanedMessage) : cleanedMessage

  // Build the log message
  const paddedLevel = level.toUpperCase().padEnd(MAX_LEVEL_LENGTH)
  const logPrefix = `${logTimestamp()} ${colorFunc(paddedLevel)}`
  const logMessage = ` ${filteredMessage}` // Space after prefix for consistent alignment

  // Handle silent mode for debug logs
  if (level === 'debug' && env.APP_LOG_LEVEL?.toLowerCase() === 'silent') {
    return
  }

  // Handle error logging
  if (message instanceof Error) {
    handleErrorLogging(level, message, logPrefix, logFunc)
  } else {
    // Safely process additional arguments without cutting off objects or non-strings
    const strippedArgs = args.map(stripNewLinesAndSpaces)

    // Log the message with the color formatting and additional arguments
    logFunc(logPrefix, logMessage, ...strippedArgs)
  }
}

/**
 * An object that provides methods for logging messages with different log levels.
 *
 * Example usage:
 *  logger.info('This is an info message');
 *  logger.debug('This is a debug message');
 *  logger.error('This is an error message', { someError: 'details' });
 *  logger.warn('This is a warning');
 *  logger.query('SELECT * FROM users');
 *  logger.trace('This is a trace message with full details');
 *
 * Each method takes a message string and optional additional arguments to be logged.
 */
export default {
  info: (message: string | unknown, ...args: unknown[]) => log('info', message, ...args),
  warn: (message: string | unknown, ...args: unknown[]) => log('warn', message, ...args),
  error: (message: string | unknown, ...args: unknown[]) => log('error', message, ...args),
  debug: (message: string | unknown, ...args: unknown[]) => log('debug', message, ...args),
  query: (message: string | unknown, ...args: unknown[]) => log('query', message, ...args),
  trace: (message: string | unknown, ...args: unknown[]) => log('trace', message, ...args),
}
