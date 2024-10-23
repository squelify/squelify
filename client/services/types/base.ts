import type { LogLevel } from 'consola'

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
  message?: string
  data?: T
  error?: {
    hint?: number
    reason?: string
  }
}

// TODO: infer from API response
export interface HealthCheckData {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  uptime: number
  database: {
    status: 'up' | 'down'
    latency: number
  }
  memory: {
    heapUsed: number
    heapTotal: number
    external: number
  }
}
