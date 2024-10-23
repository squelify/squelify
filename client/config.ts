import type { LogLevel } from 'consola/core'
import { isProduction } from 'std-env'

/**
 * Defines the log level for the application.
 * The log level is determined by the environment variable `PROD`. If `PROD` is true,
 * the log level is set to silent (-999). Otherwise, the log level is set to verbose (+999).
 *
 * The available log levels are:
 * - 0: Fatal and Error
 * - 1: Warnings
 * - 2: Normal logs
 * - 3: Informational logs, success, fail, ready, start, ...
 * - 4: Debug logs
 * - 5: Trace logs
 * - -999: Silent
 * - +999: Verbose logs
 *
 * @see: https://unjs.io/packages/consola#log-level
 */
export const LOG_LEVEL: LogLevel = Number(import.meta.env.APP_LOG_LEVEL) || (isProduction ? 3 : 4)

/**
 * Defines the base URL for the API based on the environment.
 * If the `VITE_API_URL` environment variable is set, it will be used as the base URL.
 * Otherwise, if the application is running in development mode (`process.env.NODE_ENV === 'development'`),
 * the base URL will be `/api`. If the application is running in production mode,
 * the base URL will be `http://localhost:3000/api`.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
