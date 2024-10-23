import type { LogLevel } from 'consola'

export interface ApiClientOptions {
  /** Base URL for API requests */
  baseUrl?: string
  /** Custom headers for all requests */
  headers?: { [key: string]: string }
  /** Enable debug mode or provide a custom logging function */
  logLevel?: LogLevel
}

export interface ApiResponse<T = unknown> {
  status: number
  success: boolean
  message?: string
  data?: T
  error?: {
    hint?: number
    reason?: string
  }
}

export interface HealthCheckData {
  dbVersion: string
  timestamp: number
  uptime: number
}
