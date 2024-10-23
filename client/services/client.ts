import { type ConsolaInstance, type LogLevel, createConsola } from 'consola'
import { type $Fetch, FetchError, ofetch } from 'ofetch'
import { hasWindow, isProduction } from 'std-env'
import AuthService from './modules/auth.service'
import { DEFAULT_OPTIONS } from './options'
import type { ApiClientOptions, HealthCheckData } from './types/base'

const HTTPRegexp = /^http:\/\//

interface RequestOptions extends RequestInit {
  clientInfo?: string
}

export default class ApiClient {
  private static instance: ApiClient
  private static nextInstanceID = 0
  protected static logTag = 'ApiClient'

  private instanceID: number
  private fetcher: $Fetch
  private clientInfo: string

  protected baseURL: string
  protected logLevel: LogLevel
  protected logger: ConsolaInstance

  protected headers: {
    [key: string]: string
  }

  auth: AuthService

  constructor(options: ApiClientOptions) {
    this.instanceID = ApiClient.nextInstanceID
    ApiClient.nextInstanceID += 1

    /**
     * Initializes the some properties of the `ApiClient` class with a default value.
     * The `clientInfo` property is used to identify the client making requests to the API.
     * The `DEFAULT_OPTIONS` object is merged with the provided `options` object,
     * and the resulting object is used to configure the `ApiClient` instance.
     */
    const clientInfo = `ApiClient-${import.meta.env.APP_VERSION}`
    const settings = { ...DEFAULT_OPTIONS, ...options, clientInfo }

    // By default, in DEV mode we log all requests and responses.
    // This setting can be overridden via the `logLevel` option.
    const defaultLogLevel = settings.logLevel || import.meta.env.PROD ? -999 : 5
    this.logLevel = options.logLevel ?? defaultLogLevel
    this.logger = createConsola({
      level: this.logLevel,
    })

    if (this.instanceID > 0 && hasWindow) {
      this.logger.warn(
        ApiClient.logTag,
        'Multiple ApiClient instances detected in the same browser context.',
        'It may produce undefined behavior when used concurrently under the same storage key.'
      )
    }

    this.baseURL = settings.baseURL ?? ''
    this.headers = settings.headers || {}
    this.clientInfo = settings.clientInfo
    this.fetcher = this._createFetcher()
    this.auth = new AuthService(this)

    if (isProduction && HTTPRegexp.test(this.baseURL)) {
      this.logger.warn(
        ApiClient.logTag,
        'NEVER USE HTTP IN PRODUCTION. Always use HTTPS for secure operations.'
      )
    }
  }

  static getInstance(options?: ApiClientOptions): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(options || {})
    }
    return ApiClient.instance
  }

  private _createFetcher(): $Fetch {
    const logger = this.logger
    return ofetch.create({
      baseURL: this.baseURL,
      async onRequest(_ctx) {
        // Do something before request is sent.
        // logger.debug('onRequest', ctx.request)
      },
      async onResponse(ctx) {
        // Extract the request path from the request URL
        const requestUrl = new URL(ctx.request.toString())
        const requestPath = requestUrl.pathname
        const ignoredPaths = ['/api/healthz']

        if (ignoredPaths.includes(requestPath)) {
          return
        }

        // Do something after response is received.
        logger.debug('onResponse', {
          url: ctx.response.url,
          status: ctx.response.status,
          statusText: ctx.response.statusText,
          headers: ctx.response.headers,
          _data: ctx.response._data,
        })
      },
    })
  }

  async _request<T>(path: string, options?: RequestOptions) {
    const headers: HeadersInit = new Headers(options?.headers)

    // Set default request headers
    headers.append('Accept', 'application/json')
    headers.append('Content-Type', 'application/json')

    if (options?.clientInfo && !headers.has('X-Client-Info')) {
      headers.append('X-Client-Info', options.clientInfo)
    } else {
      headers.append('X-Client-Info', this.clientInfo)
    }

    try {
      return await this.fetcher<T>(path, { ...options, headers })
    } catch (error) {
      if (error instanceof FetchError && error.data) {
        if (error.data.error) {
          error.message = error.data.error.message
        }
      }
      throw error
    }
  }

  _healthCheck(): Promise<HealthCheckData> {
    return this._request<HealthCheckData>('/healthz')
  }
}
