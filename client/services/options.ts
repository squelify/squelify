import type { CookieSetOptions } from 'universal-cookie'
import { LOG_LEVEL } from '#/utils/logger'
import type { ApiClientOptions } from './types'

/**
 * The default options for the API client.
 *
 * This object contains the base URL for the API and the log level to use.
 * These options can be overridden when creating an API client instance.
 *
 * If the `SQUELIFY_BASE_URL` environment variable is set, it will be used as the base URL.
 * Otherwise, if the application is running in development mode, the base URL will be `/api`.
 * If the application is running in production mode, the base URL will be `http://localhost:3278/api`.
 */
export const DEFAULT_OPTIONS: Omit<Required<ApiClientOptions>, 'headers'> = {
  baseURL: '/api',
  logLevel: LOG_LEVEL,
}

export const COOKIE_OPTIONS: Omit<CookieSetOptions, 'maxAge'> = {
  path: '/',
  sameSite: 'lax',
  secure: window.location.protocol === 'https:',
  domain: window.location.hostname,
}

export const AUTH_COOKIE_NAME = 'auth_session'
