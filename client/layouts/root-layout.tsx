import React, { useEffect, useRef } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import { Toaster, toast } from 'sonner'
import { env } from 'std-env'
import { HealthCheckResponse } from '~/api/healthz'
import { useApiClient } from '#/context/hooks/use-api-client'
import type { ApiResponse } from '#/services'
import { clx } from '#/utils/helper'
import logger from '#/utils/logger'

interface RootLayoutProps {
  children: React.ReactNode
  className?: string
}

// Enable this to show error boundary instead of toast
const BLOCK_ON_ERROR = env.APP_LOG_LEVEL === 'trace' || false

// Health check configuration
const HEALTH_CHECK_CONFIG = {
  interval: 60 * 1000 * 5, // 5 minutes in milliseconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const

export default function RootLayout({ children, className }: RootLayoutProps) {
  const { showBoundary } = useErrorBoundary()
  const apiClient = useRef(useApiClient()).current
  const lastCheckTimeRef = useRef<number>(0)
  const retryCountRef = useRef<number>(0)

  useEffect(() => {
    const handleUnhealthyStatus = (result: HealthCheckResponse) => {
      const message =
        result.database.status === 'down' ? 'Database connection is down' : 'API is not healthy'

      const description = [
        `Latency: ${result.database.latency}`,
        `Memory: ${result.resources.heapUsed} used of ${result.resources.heapTotal}`,
        `Uptime: ${result.uptime}`,
      ].join(' | ')

      if (BLOCK_ON_ERROR) {
        showBoundary({ message: `${message}: ${description}` })
      }

      toast.error(message)
    }

    const handleError = (error: unknown) => {
      logger.error('[ERROR] Health Check Failed:', error)

      if (error instanceof Error) {
        if (BLOCK_ON_ERROR) showBoundary({ message: error.message })
        toast.error('Health Check Error', { description: error.message })
        return
      }

      if (isApiError(error)) {
        if (BLOCK_ON_ERROR) {
          showBoundary({ code: 500, message: error.error?.reason || 'Unknown error occurred' })
        }
        toast.error('API Error', { description: error.error?.reason || 'Unknown error occurred' })
        return
      }

      if (BLOCK_ON_ERROR) showBoundary({ message: 'An unexpected error occurred' })
      toast.error('Unexpected Error', { description: 'Failed to check API health status' })
    }

    const doHealthCheck = async () => {
      const now = Date.now()
      if (now - lastCheckTimeRef.current < HEALTH_CHECK_CONFIG.interval) {
        return
      }

      lastCheckTimeRef.current = now
      logger.info('Performing health check...')

      try {
        const result = await apiClient._healthCheck()
        logger.debug('Health Check Details:', result)

        if (result.status === 'unhealthy' || result.database.status === 'down') {
          handleUnhealthyStatus(result)

          // Retry logic
          if (retryCountRef.current < HEALTH_CHECK_CONFIG.retryAttempts) {
            retryCountRef.current++
            setTimeout(doHealthCheck, HEALTH_CHECK_CONFIG.retryDelay)
            return
          }
        } else {
          retryCountRef.current = 0
        }

        logger.info('[RESULT] Health Check Status:', result.status)
      } catch (error: unknown) {
        handleError(error)
      }
    }

    doHealthCheck()
    const intervalId = setInterval(doHealthCheck, HEALTH_CHECK_CONFIG.interval)

    return () => clearInterval(intervalId)
  }, [apiClient, showBoundary])

  return (
    <React.Fragment>
      <div className={clx(className)}>{children}</div>
      <Toaster richColors theme="system" />
    </React.Fragment>
  )
}

function isApiError(error: unknown): error is { error?: ApiResponse<unknown>['error'] } {
  return typeof error === 'object' && error !== null && 'error' in error
}
