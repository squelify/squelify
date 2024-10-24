import type { ConsolaInstance } from 'consola/core'
import { createConsola } from 'consola/core'
import { env, isProduction } from 'std-env'

type LogLevelString = 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'trace'

const LOG_LEVEL_MAP: Record<LogLevelString, number> = {
  silent: -999,
  error: 0,
  warn: 1,
  info: 3,
  debug: 4,
  trace: 5,
}

function getNumericLogLevel(level: LogLevelString | undefined): number {
  if (!level) return isProduction ? 3 : 5
  return LOG_LEVEL_MAP[level] ?? 3
}

const LOG_LEVEL = getNumericLogLevel(String(env.APP_LOG_LEVEL).toLowerCase() as LogLevelString)

/**
 * Creates a Consola instance for logging.
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
 * @returns {ConsolaInstance} A Consola instance for logging.
 * @see https://unjs.io/packages/consola
 */
const logger: ConsolaInstance = createConsola({ level: LOG_LEVEL })

export { LOG_LEVEL, logger as default }
