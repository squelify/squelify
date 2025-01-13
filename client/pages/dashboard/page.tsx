import * as Lucide from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { HealthCheckResponse } from '~/api/healthz.get'
import { useApiClient } from '#/context/hooks/use-api-client'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'
import PageWrapper from '#/layouts/page-wrapper'
import logger from '#/utils/logger'
// import CardGetStarted from './card-get-started'
import CardSystemMetrics from './card-metrics'
import CardQuickAccess from './card-quick-access'
import CardResources from './card-resources'
import CardStats from './card-stats'

// Health check configuration
const HEALTH_CHECK_CONFIG = {
  interval: 60 * 1000, // 1 minute in milliseconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const

export default function Page() {
  useSEOMeta('Dashboard')

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

  const renderMetric = (value: string | number | undefined, fallback = '-') => {
    if (isLoading) {
      return (
        <span className="animate-pulse rounded-sm bg-muted px-3" aria-busy="true">
          Loading...
        </span>
      )
    }
    return String(value ?? fallback)
  }

  return (
    <PageWrapper className="container mx-auto mb-8 flex w-full flex-col space-y-4 p-6 md:space-y-8 md:p-6 lg:p-8">
      <div className="grid gap-6">
        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4">
          <CardStats
            title="System Status"
            value={renderMetric(healthData?.status)}
            trend={{ label: 'Uptime', value: renderMetric(healthData?.uptime) }}
            icon={Lucide.Activity}
            className="capitalize"
          />
          <CardStats
            title="Database"
            value={renderMetric(
              healthData?.database.status === 'up' ? 'Connected' : 'Disconnected'
            )}
            trend={{ label: 'Latency', value: renderMetric(healthData?.database.latency) }}
            icon={Lucide.Database}
          />
          <CardStats
            title="API Requests"
            value="2.4k"
            trend={{ label: '24h', value: '+12.5%' }}
            icon={Lucide.Network}
          />
          <CardStats
            title="Active Users"
            value="156"
            trend={{ label: '24h', value: '+3.2%' }}
            icon={Lucide.Users}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-8">
          <CardSystemMetrics className="md:col-span-6" />
          <CardResources className="md:col-span-2" />
        </div>
      </div>

      {/* Get Started */}
      {/* <CardGetStarted /> */}

      {/* Quick Access */}
      <div className="grid gap-4">
        <h2 className="flex items-center gap-2 px-1 font-medium text-lg">
          <Lucide.SquareSlash className="size-5" strokeWidth={2} />
          Quick Access
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <CardQuickAccess />
        </div>
      </div>
    </PageWrapper>
  )
}
