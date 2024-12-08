import * as Lucide from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router'
import { toast } from 'sonner'
import { HealthCheckResponse } from '~/api/healthz.get'
import { Button } from '#/components/base-ui/button'
import { Card, CardHeader, CardTitle } from '#/components/base-ui/card'
import { CardContent, CardDescription } from '#/components/base-ui/card'
import { Link } from '#/components/link'
import { useApiClient } from '#/context/hooks/use-api-client'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'
import type { AppContextType } from '#/providers/app-provider'
import logger from '#/utils/logger'

// Health check configuration
const HEALTH_CHECK_CONFIG = {
  interval: 60 * 1000, // 1 minute in milliseconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const

export default function Page() {
  useSEOMeta('Dashboard')

  const ctx = useOutletContext<AppContextType>()
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
    <div className="mx-auto w-full max-w-screen-xl space-y-6 px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lucide.Activity className="size-5" />
            System Overview
          </CardTitle>
          <CardDescription>Welcome back, {ctx.user?.displayName}!</CardDescription>
        </CardHeader>
      </Card>

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
                <span className="ml-2 font-bold">
                  {renderMetric(healthData?.resources.heapUsed)}
                </span>
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
                <span className="ml-2 font-bold capitalize">
                  {renderMetric(healthData?.status)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lucide.Rocket className="size-5" />
            Get Started with Squelify
          </CardTitle>
          <CardDescription>Quick setup guides and essential features</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lucide.Key className="size-4" />
                Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="-mt-2 space-y-4">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Set up user authentication with:</p>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  <li>Email/Password</li>
                  <li>OAuth providers</li>
                  <li>Two-factor (2FA)</li>
                  <li>Passkey (WebAuthn)</li>
                </ul>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/settings/auth">
                  <Lucide.ArrowRight className="mr-2 size-4" />
                  <span>Configure Auth</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lucide.Database className="size-4" />
                Content Management
              </CardTitle>
            </CardHeader>
            <CardContent className="-mt-2 space-y-4">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Start managing content with:</p>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  <li>Dynamic content types</li>
                  <li>Flexible modeling</li>
                  <li>Rich text editor</li>
                  <li>Media library</li>
                </ul>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/content">
                  <Lucide.ArrowRight className="mr-2 size-4" />
                  <span>Create Content</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lucide.Wrench className="size-4" />
                Developer Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="-mt-2 space-y-4">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Access developer features:</p>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  <li>RESTful API</li>
                  <li>Real-time subscriptions</li>
                  <li>Role-based access</li>
                  <li>Webhooks</li>
                </ul>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/docs" newTab>
                  <Lucide.ArrowRight className="mr-2 size-4" />
                  <span>View API Docs</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lucide.HelpCircle className="size-5" />
            Resources
          </CardTitle>
          <CardDescription>Quick access to help and documentation</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/docs" newTab>
              <Lucide.BookOpen className="mr-2 size-4" />
              <span>Documentation</span>
            </Link>
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/github" newTab>
              <Lucide.LifeBuoy className="mr-2 size-4" />
              <span>Support</span>
            </Link>
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => ctx.logout()}>
            <Lucide.LogOut className="mr-2 size-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
