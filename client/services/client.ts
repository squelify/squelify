import { type ConsolaInstance, type LogLevel, createConsola } from 'consola'
import { type $Fetch, FetchError, ofetch } from 'ofetch'
import { hasWindow, isProduction } from 'std-env'
import { HealthCheckResponse } from '~/api/healthz.get'
import { authStore } from '#/context/stores/auth.store'
import { LOG_LEVEL } from '#/utils/logger'

import AccountService from './modules/account.service'
import AuditLogService from './modules/auditlog.service'
import AuthService from './modules/auth.service'
import CollectionService from './modules/collection.service'
import JWKService from './modules/jwk.service'
import MediaLibraryService from './modules/media.service'
import OrganizationService from './modules/organization.service'
import PermissionService from './modules/permission.service'
import RoleService from './modules/role.service'
import SettingsService from './modules/settings.service'
import UserService from './modules/user.service'
import WebhooksService from './modules/webhooks.service'

import { DEFAULT_OPTIONS } from './options'
import type { ApiClientOptions } from './types'

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

  account: AccountService
  auditlog: AuditLogService
  auth: AuthService
  collection: CollectionService
  jwk: JWKService
  media: MediaLibraryService
  organization: OrganizationService
  permission: PermissionService
  role: RoleService
  settings: SettingsService
  user: UserService
  webhooks: WebhooksService

  constructor(options: ApiClientOptions) {
    this.instanceID = ApiClient.nextInstanceID
    ApiClient.nextInstanceID += 1

    /**
     * Initializes the some properties of the `ApiClient` class with a default value.
     * The `clientInfo` property is used to identify the client making requests to the API.
     * The `DEFAULT_OPTIONS` object is merged with the provided `options` object,
     * and the resulting object is used to configure the `ApiClient` instance.
     */
    const clientInfo = `ApiClient ${import.meta.env.SQUELIFY_VERSION}`
    const settings = { ...DEFAULT_OPTIONS, ...options, clientInfo }

    // By default, in DEV mode we log all requests and responses.
    // This setting can be overridden via the `logLevel` option.
    const defaultLogLevel = settings.logLevel || LOG_LEVEL
    this.logLevel = options.logLevel ?? defaultLogLevel
    this.logger = createConsola({
      level: this.logLevel,
      defaults: { tag: ApiClient.logTag },
    })

    if (this.instanceID > 0 && hasWindow) {
      this.logger.warn(
        ApiClient.logTag,
        'Multiple ApiClient instances detected in the same browser context',
        'It may produce undefined behavior when used concurrently under the same storage key.'
      )
    }

    this.baseURL = options.baseURL || settings.baseURL
    this.headers = settings.headers || {}
    this.clientInfo = settings.clientInfo
    this.fetcher = this._createFetcher()

    // Initialize the services
    this.account = new AccountService(this)
    this.auditlog = new AuditLogService(this)
    this.auth = new AuthService(this)
    this.collection = new CollectionService(this)
    this.jwk = new JWKService(this)
    this.media = new MediaLibraryService(this)
    this.organization = new OrganizationService(this)
    this.permission = new PermissionService(this)
    this.role = new RoleService(this)
    this.settings = new SettingsService(this)
    this.user = new UserService(this)
    this.webhooks = new WebhooksService(this)

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
      async onRequest(ctx) {
        const authState = authStore.get()

        // Add CSRF token for mutating requests
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(ctx.options.method?.toUpperCase() || '')) {
          const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content')

          if (!ctx.options.headers.get('X-CSRF-Token') && csrfToken) {
            ctx.options.headers.set('X-CSRF-Token', csrfToken)
          }
        }

        // Check if the access token is available in the storage
        if (authState.accessToken && !ctx.options.headers.has('Authorization')) {
          ctx.options.headers.set('Authorization', `Bearer ${authState.accessToken}`)
        }

        logger.debug('onRequest', ctx.request)
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

    // Add client info header
    if (options?.clientInfo && !headers.has('X-Client-Info')) {
      headers.append('X-Client-Info', options.clientInfo)
    } else {
      headers.append('X-Client-Info', this.clientInfo)
    }

    try {
      return await this.fetcher<T>(path, { ...options, headers })
    } catch (error) {
      if (error instanceof FetchError) {
        throw new Error(error.data.message)
      }
      throw error
    }
  }

  _healthCheck(): Promise<HealthCheckResponse> {
    return this._request<HealthCheckResponse>('/healthz')
  }
}
