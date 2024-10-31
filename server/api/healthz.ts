import { sql } from 'kysely'
import { env, process } from 'std-env'

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  serviceId: string
  clientIp: string
  uptime: string
  database: {
    status: 'up' | 'down'
    version: string
    latency: number
  }
  memory: {
    heapUsed: number
    heapTotal: number
    external: number
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / (24 * 60 * 60))
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((seconds % (60 * 60)) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`)

  return parts.join(' ')
}

export default defineEventHandler(async (event): Promise<HealthCheckResponse> => {
  const startTime = performance.now()
  let dbStatus: 'up' | 'down' = 'down'
  let libsqlVersion: string

  try {
    // Check database connection by executing a simple query
    const { rows } = await sql
      .raw<{ version: string }>('SELECT sqlite_version() as version')
      .execute(event.context.db)

    libsqlVersion = rows[0].version

    dbStatus = 'up'
  } catch (_error) {
    dbStatus = 'down'
  }

  const dbLatency = performance.now() - startTime
  const memoryUsage = process.memoryUsage()

  const flyRegion = env.FLY_REGION
  const flyMachineId = env.FLY_MACHINE_ID
  const flyRequestId = event.headers.get('Fly-Request-Id')
  const serviceId = `${flyRegion}::${flyMachineId}::${flyRequestId}`
  const host = event.headers.get('X-Forwarded-Host') ?? event.headers.get('host')
  const clientIpAddr = getRequestIP(event, { xForwardedFor: true })
  const isHostedOnFly = flyRegion && flyMachineId

  return {
    status: dbStatus === 'up' ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    serviceId: isHostedOnFly ? serviceId : host,
    clientIp: clientIpAddr,
    uptime: formatUptime(process.uptime()),
    database: {
      status: dbStatus,
      version: libsqlVersion,
      latency: Math.round(dbLatency),
    },
    memory: {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
    },
  }
})
