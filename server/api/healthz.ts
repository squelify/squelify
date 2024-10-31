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
    size: string
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
  let databaseSize: string

  try {
    // Check database connection with version and size info
    const { rows } = await sql
      .raw<{ dbVersion: string; dbSize: string }>(`
        SELECT
          (SELECT sqlite_version()) as db_version,
          CASE
              WHEN size_bytes < 1024 THEN size_bytes || ' B'
              WHEN size_bytes < 1024*1024 THEN ROUND(size_bytes/1024.0, 2) || ' KB'
              WHEN size_bytes < 1024*1024*1024 THEN ROUND(size_bytes/(1024.0*1024), 2) || ' MB'
              ELSE ROUND(size_bytes/(1024.0*1024*1024), 2) || ' GB'
          END as db_size
        FROM (
            SELECT (page_count * page_size) as size_bytes
            FROM pragma_page_count(), pragma_page_size()
        )
      `)
      .execute(event.context.db)

    logger.debug('DEBUGSQL', rows)

    libsqlVersion = rows[0].dbVersion
    databaseSize = rows[0].dbSize

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
    clientIp: clientIpAddr || 'unknown',
    uptime: formatUptime(process.uptime()),
    database: {
      status: dbStatus,
      version: libsqlVersion,
      size: databaseSize,
      latency: Math.round(dbLatency),
    },
    memory: {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
    },
  }
})
