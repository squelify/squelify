import { API_BASE_URL, LOG_LEVEL } from '#/config'
import type { ApiClientOptions } from './types/base'

/**
 * The default options for the API client.
 *
 * This object contains the base URL for the API and the log level to use.
 * These options can be overridden when creating an API client instance.
 */
export const DEFAULT_OPTIONS: Omit<Required<ApiClientOptions>, 'headers'> = {
  baseUrl: API_BASE_URL,
  logLevel: LOG_LEVEL,
}
