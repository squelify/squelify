import { type H3Event } from 'h3'
import { sql } from 'kysely'
import { typeid } from 'typeid-js'
import db from '~/database/db.client'
import type { AuditAction, AuditEntity } from '~/database/schemas/audit_log'
import type { OrganizationSelect } from '~/database/schemas/organization'

interface AuditLogParams {
  action: AuditAction
  entity: AuditEntity
  entityId: string
  userId?: string
  organizationId?: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

interface RequestContext {
  user?: { id: string }
  organization?: OrganizationSelect | null
}

interface AuditLogFilters {
  startDate?: number
  endDate?: number
  userId?: string
  action?: AuditAction
  entity?: AuditEntity
}

// Single audit log insert
export async function auditLog(event: H3Event, params: AuditLogParams) {
  const ctx = event.context as RequestContext
  const headers = getRequestHeaders(event)

  await db
    .insertInto('audit_logs')
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
      ipAddress: getRequestIP(event, { xForwardedFor: true }),
      userAgent: headers['user-agent'] || 'unknown',
      createdAt: Math.floor(Date.now() / 1000),
    })
    .execute()
}

// Batch insert for multiple audit logs
export async function auditLogBatch(event: H3Event, logs: AuditLogParams[]) {
  const ctx = event.context as RequestContext
  const headers = getRequestHeaders(event)
  const now = Math.floor(Date.now() / 1000)

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
    userAgent: headers['user-agent'] || 'unknown',
    createdAt: now,
  }))

  await db.insertInto('audit_logs').values(values).execute()
}

// Cleanup old audit logs
export async function cleanupAuditLogs(retentionDays = 90) {
  const cutoff = Math.floor(Date.now() / 1000) - retentionDays * 24 * 60 * 60

  await db.deleteFrom('audit_logs').where('createdAt', '<', cutoff).execute()
}

// Export audit logs
export async function exportAuditLogs(filters: AuditLogFilters) {
  const query = db.selectFrom('audit_logs')

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

// Query builder for flexible searching
export class AuditLogQuery {
  private query = db.selectFrom('audit_logs')

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
    return await this.query.selectAll().orderBy('createdAt', 'desc').execute()
  }
}

// Get audit statistics
export async function getAuditStats(timeframe: number) {
  const startTime = Math.floor(Date.now() / 1000) - timeframe

  return await db
    .selectFrom('audit_logs')
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
}
