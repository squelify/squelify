import { type H3Event } from 'h3'
import { sql } from 'kysely'
import { env } from 'std-env'
import { typeid } from 'typeid-js'
import db from '~/database/db.client'
import type { AuditAction, AuditEntity } from '~/database/schemas/audit_log'
import { AUDIT_RETENTION } from '~/database/schemas/audit_log'
import type { Organization } from '~/database/schemas/organization'

interface AuditLogParams {
  action: AuditAction
  entity: AuditEntity
  entityId: string
  userId?: string
  organizationId?: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  metadata: {
    success: boolean
    [key: string]: unknown
  }
  retention?: keyof typeof AUDIT_RETENTION
}

interface RequestContext {
  user?: { id: string }
  organization?: Organization | null
}

interface AuditLogFilters {
  startDate?: number
  endDate?: number
  userId?: string
  action?: AuditAction
  entity?: AuditEntity
}

const isAuditEnabled = env.SQUELIFY_AUDIT_LOG_ENABLE !== 'false'

async function executeIfEnabled(fn: () => Promise<void>) {
  if (isAuditEnabled) {
    await fn()
  }
}

function getRetentionPeriod(
  action: AuditAction,
  entity: AuditEntity,
  retention?: keyof typeof AUDIT_RETENTION
): number {
  if (retention) {
    return AUDIT_RETENTION[retention]
  }

  if (action === 'delete' || action === 'update') {
    if (['user', 'organization', 'role'].includes(entity)) {
      return AUDIT_RETENTION.CRITICAL
    }
  }

  if (['authenticate', 'login', 'logout'].includes(action)) {
    return AUDIT_RETENTION.COMPLIANCE
  }

  return AUDIT_RETENTION.DEFAULT
}

export async function auditLog(event: H3Event, params: AuditLogParams) {
  await executeIfEnabled(async () => {
    const ctx = event.context as RequestContext
    const { clientIpAddress, userAgent } = getClientInfo(event)
    const retention = getRetentionPeriod(params.action, params.entity, params.retention)

    await db
      .insertInto('_sq_audit_logs')
      .values({
        id: typeid('log').toString(),
        userId: params.userId || ctx.user?.id || null,
        organizationId: params.organizationId || ctx.organization?.id || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        oldValues: JSON.stringify(params.oldValues || {}),
        newValues: JSON.stringify(params.newValues || {}),
        metadata: JSON.stringify(params.metadata || {}),
        ipAddress: clientIpAddress,
        userAgent: userAgent || 'unknown',
        retention,
        createdAt: Math.floor(Date.now() / 1000),
      })
      .execute()
  })
}

export async function auditLogBatch(event: H3Event, logs: AuditLogParams[]) {
  await executeIfEnabled(async () => {
    const ctx = event.context as RequestContext
    const { userAgent } = getClientInfo(event)

    const values = logs.map((log) => ({
      id: typeid('log').toString(),
      userId: log.userId || ctx.user?.id || null,
      organizationId: log.organizationId || ctx.organization?.id || null,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      oldValues: JSON.stringify(log.oldValues || {}),
      newValues: JSON.stringify(log.newValues || {}),
      metadata: JSON.stringify(log.metadata || {}),
      ipAddress: getRequestIP(event),
      userAgent: userAgent || 'unknown',
      retention: getRetentionPeriod(log.action, log.entity, log.retention),
      createdAt: Math.floor(Date.now() / 1000),
    }))

    await db.insertInto('_sq_audit_logs').values(values).execute()
  })
}

export async function exportAuditLog(filters: AuditLogFilters) {
  if (!isAuditEnabled) return []

  const query = db.selectFrom('_sq_audit_logs')

  if (filters.startDate) {
    query.where('createdAt', '>=', filters.startDate)
  }
  if (filters.endDate) {
    query.where('createdAt', '<=', filters.endDate)
  }
  if (filters.userId) {
    query.where('userId', '=', filters.userId)
  }
  if (filters.action) {
    query.where('action', '=', filters.action)
  }
  if (filters.entity) {
    query.where('entity', '=', filters.entity)
  }

  return await query.selectAll().orderBy('createdAt', 'desc').execute()
}

export class AuditLogQuery {
  private query = db.selectFrom('_sq_audit_logs')

  filterByDateRange(start: number, end: number) {
    this.query.where('createdAt', '>=', start).where('createdAt', '<=', end)
    return this
  }

  filterByUser(userId: string) {
    this.query.where('userId', '=', userId)
    return this
  }

  filterByAction(action: AuditAction) {
    this.query.where('action', '=', action)
    return this
  }

  filterByEntity(entity: AuditEntity) {
    this.query.where('entity', '=', entity)
    return this
  }

  async execute() {
    if (!isAuditEnabled) return []
    return await this.query.selectAll().orderBy('createdAt', 'desc').execute()
  }
}

export async function getAuditStats(timeframe: number) {
  if (!isAuditEnabled) return []

  const startTime = Math.floor(Date.now() / 1000) - timeframe

  return await db
    .selectFrom('_sq_audit_logs')
    .select([
      'action',
      'entity',
      sql`count(*)`.as('count'),
      sql`min(createdAt)`.as('first_seen'),
      sql`max(createdAt)`.as('last_seen'),
    ])
    .where('createdAt', '>=', startTime)
    .groupBy(['action', 'entity'])
    .execute()
}

// Critical changes notification
export async function notifyCriticalChanges(log: AuditLogParams) {
  await executeIfEnabled(async () => {
    const criticalActions: AuditAction[] = ['delete', 'update']
    const criticalEntities: AuditEntity[] = ['user', 'organization', 'role']

    if (criticalActions.includes(log.action) && criticalEntities.includes(log.entity)) {
      // TODO: Send notification to some channel, for now just log it
      logger.warn('[audit]', `Critical ${log.action} on ${log.entity}`)
      // await sendNotification({
      //   type: 'audit_alert',
      //   title: `Critical ${log.action} on ${log.entity}`,
      //   data: log,
      // })
    }
  })
}
