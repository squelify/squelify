import * as Lucide from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { HealthCheckResponse } from '~/api/healthz.get'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/base-ui/card'
import { useApiClient } from '#/context/hooks/use-api-client'
import type { AppContextType } from '#/providers/app-provider'
import logger from '#/utils/logger'

// Health check configuration
const HEALTH_CHECK_CONFIG = {
  interval: 60 * 1000, // 1 minute in milliseconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const

export default function CardInfoStatus() {
  const { current: apiClient } = useRef(useApiClient())

  const lastCheckTimeRef = useRef<number>(0)
  const retryCountRef = useRef<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const healthDataRef = useRef<HealthCheckResponse | null>(null)

  useEffect(() => {
    const handleUnhealthyStatus = (result: HealthCheckResponse) => {
      const message =
        result.database.status === 'down' ? 'Database connection is down' : 'API is not healthy'

      const description = [
        `Latency: ${result.database.latency}`,
        `Memory: ${result.resources.heapUsed} used of ${result.resources.heapTotal}`,
        `Uptime: ${result.uptime}`,
      ].join(' | ')

      toast.error(message, { description })
    }

    const handleError = (error: unknown) => {
      logger.error('[ERROR] Health Check Failed:', error)
      toast.error('Dashboard Health Check Error', {
        description: error instanceof Error ? error.message : 'Failed to check system health',
      })
    }

    const doHealthCheck = async () => {
      const now = Date.now()
      if (now - lastCheckTimeRef.current < HEALTH_CHECK_CONFIG.interval) {
        return
      }

      lastCheckTimeRef.current = now
      logger.info('Performing health check...')

      try {
        setIsLoading(true)
        const result = await apiClient._healthCheck()
        healthDataRef.current = result
        logger.debug('Health Check Details:', result)

        if (result.status === 'unhealthy' || result.database.status === 'down') {
          handleUnhealthyStatus(result)

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
      } finally {
        setIsLoading(false)
      }
    }

    doHealthCheck()
    const intervalId = setInterval(doHealthCheck, HEALTH_CHECK_CONFIG.interval)

    return () => clearInterval(intervalId)
  }, [])

  const healthData = healthDataRef.current

  const renderMetric = (value: string | undefined, fallback = '-') => {
    if (isLoading) return <span className="animate-pulse rounded bg-muted px-3">Loading...</span>
    return value || fallback
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lucide.Database className="size-5" />
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div
              className={`mr-2 size-3 rounded-full ${healthData?.database.status === 'up' ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="font-bold text-2xl">
              {renderMetric(healthData?.database.status === 'up' ? 'Connected' : 'Disconnected')}
            </span>
          </div>
          <p className="mt-2 text-muted-foreground text-sm">
            Latency: {renderMetric(healthData?.database.latency)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lucide.HardDrive className="size-5" />
            System Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground text-sm">Memory Usage:</span>
              <span className="ml-2 font-bold">{renderMetric(healthData?.resources.heapUsed)}</span>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">Total Memory:</span>
              <span className="ml-2 font-bold">
                {renderMetric(healthData?.resources.heapTotal)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lucide.Clock className="size-5" />
            System Uptime
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="font-bold text-2xl">{renderMetric(healthData?.uptime)}</span>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">Status:</span>
              <span className="ml-2 font-bold capitalize">{renderMetric(healthData?.status)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
