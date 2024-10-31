import os from 'node:os'
import { sql } from 'kysely'
import { env, process } from 'std-env'
import pkg from '~~/package.json' assert { type: 'json' }

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  appVersion: string
  environment: string
  timestamp: string
  serviceId: string
  clientIp: string
  uptime: string
  database: {
    status: 'up' | 'down'
    version: string
    size: string
    latency: string
  }
  resources: {
    heapUsed: string
    heapTotal: string
    external: string
    cpuUsage: string
  }
}

function getCpuUsage(): number {
  const cpus = os.cpus()
  const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0)
  const totalTick = cpus.reduce(
    (acc, cpu) => acc + Object.values(cpu.times).reduce((a, b) => a + b),
    0
  )
  return Math.round((1 - totalIdle / totalTick) * 100)
}

// Format number to include thousand separators and unit
function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

// Format bytes to human readable size
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
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
    appVersion: pkg.version,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    serviceId: isHostedOnFly ? serviceId : host,
    clientIp: clientIpAddr || 'unknown',
    uptime: formatUptime(process.uptime()),
    database: {
      status: dbStatus,
      version: libsqlVersion,
      size: databaseSize,
      latency: `${formatNumber(Math.round(dbLatency))}ms`,
    },
    resources: {
      heapUsed: `${formatBytes(memoryUsage.heapUsed)}`,
      heapTotal: `${formatBytes(memoryUsage.heapTotal)}`,
      external: `${formatBytes(memoryUsage.external)}`,
      cpuUsage: `${getCpuUsage()}%`,
    },
  }
})
