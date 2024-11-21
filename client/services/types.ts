import type { LogLevel } from 'consola'
import { IUserInfoResponse } from '~/api/auth/whoami.post'

export interface ApiClientOptions {
  /** Base URL for API requests */
  baseURL?: string
  /** Custom headers for all requests */
  headers?: { [key: string]: string }
  /** Enable debug mode or provide a custom logging function */
  logLevel?: LogLevel
}

export interface ApiResponse<T = unknown> {
  status: number
  success: boolean
  message: string | null
  data?: T
  error?: {
    issues?: Array<{ field: string; message: string }>
    stack?: string
  }
}

export type UserInfo = IUserInfoResponse['user']
