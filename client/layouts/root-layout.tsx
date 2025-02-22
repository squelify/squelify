import consola from 'consola'
import React, { useEffect, useRef } from 'react'
import { useErrorBoundary } from 'react-error-boundary'
import { env } from 'std-env'
import { Toaster, toast } from '#/components/base-ui'
import { clx } from '#/utils/helper'

interface RootLayoutProps {
  children: React.ReactNode
  className?: string
}

// Enable this to show error boundary instead of toast
const BLOCK_ON_ERROR = env.SQUELIFY_LOG_LEVEL === 'trace' || false

// Health check configuration
const HEALTH_CHECK_CONFIG = {
  interval: 60 * 1000 * 5, // 5 minutes in milliseconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const

export default function RootLayout({ children, className }: RootLayoutProps) {
  const { showBoundary } = useErrorBoundary()
  const lastCheckTimeRef = useRef<number>(0)

  useEffect(() => {
    const handleError = (error: unknown) => {
      consola.error('[ERROR] Health Check Failed:', error)

      if (error instanceof Error) {
        if (BLOCK_ON_ERROR) showBoundary({ message: error.message })
        toast.error('Health Check Error', { description: error.message })
        return
      }

      if (isApiError(error)) {
        if (BLOCK_ON_ERROR) {
          showBoundary({ code: 500, message: error || 'Unknown error occurred' })
        }
        toast.error('API Error', { description: 'Unknown error occurred' })
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
      consola.withTag('doHealthCheck').debug('Performing health check...')

      try {
        consola.withTag('doHealthCheck').debug('Health Check Status:')
      } catch (error: unknown) {
        handleError(error)
      }
    }

    doHealthCheck()
    const intervalId = setInterval(doHealthCheck, HEALTH_CHECK_CONFIG.interval)

    return () => clearInterval(intervalId)
  }, [showBoundary])

  return (
    <React.Fragment>
      <div className={clx(className)}>{children}</div>
      <Toaster richColors theme="system" />
    </React.Fragment>
  )
}

function isApiError(error: unknown): error is { error?: ApiResponse<unknown>['data'] } {
  return typeof error === 'object' && error !== null && 'error' in error
}
