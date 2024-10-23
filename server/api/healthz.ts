import { process } from 'std-env'

interface HealthCheckResponse {
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

export default defineCachedEventHandler(
  async (event): Promise<HealthCheckResponse> => {
    const startTime = performance.now()
    let dbStatus: 'up' | 'down' = 'down'

    try {
      // Check database connection
      await event.context.db
        .selectFrom('users')
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirst()

      dbStatus = 'up'
    } catch (_error) {
      dbStatus = 'down'
    }

    const dbLatency = performance.now() - startTime
    const memoryUsage = process.memoryUsage()

    return {
      status: dbStatus === 'up' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        latency: Math.round(dbLatency),
      },
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
      },
    }
  },
  {
    maxAge: 30, // Cache for 30 seconds
    swr: true, // Stale while revalidate
  }
)
