import { LOG_LEVEL } from '#/utils/logger'
import type { ApiClientOptions } from './types/base'

/**
 * The default options for the API client.
 *
 * This object contains the base URL for the API and the log level to use.
 * These options can be overridden when creating an API client instance.
 *
 * If the `APP_BASE_URL` environment variable is set, it will be used as the base URL.
 * Otherwise, if the application is running in development mode (`process.env.NODE_ENV === 'development'`),
 * the base URL will be `/api`. If the application is running in production mode,
 * the base URL will be `http://localhost:3000/api`.
 */
export const DEFAULT_OPTIONS: Omit<Required<ApiClientOptions>, 'headers'> = {
  baseURL: '/api',
  logLevel: LOG_LEVEL,
}
