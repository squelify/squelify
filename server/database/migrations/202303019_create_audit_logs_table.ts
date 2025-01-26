import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export const up = async (db: Kysely<Database>): Promise<void> => {
  await db.schema
    .createTable('_sq_audit_logs')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.references('_sq_users.id'))
    .addColumn('organization_id', 'text', (col) => col.references('_sq_organizations.id'))
    .addColumn('action', 'text', (col) => col.notNull())
    .addColumn('entity', 'text', (col) => col.notNull())
    .addColumn('entity_id', 'text', (col) => col.notNull())
    .addColumn('old_values', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('new_values', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('metadata', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('ip_address', 'text')
    .addColumn('user_agent', 'text')
    .addColumn('retention', 'integer', (col) => col.notNull().defaultTo(90 * 86400))
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  /**
   * Index for user-based audit trail lookups
   * Optimizes queries that fetch audit logs for specific users
   */
  await db.schema
    .createIndex('_sq_idx_audit_logs_user')
    .on('_sq_audit_logs')
    .column('user_id')
    .ifNotExists()
    .execute()

  /**
   * Index for organization-based audit trail lookups
   * Enhances queries that fetch audit logs for organizations
   */
  await db.schema
    .createIndex('_sq_idx_audit_logs_organization')
    .on('_sq_audit_logs')
    .column('organization_id')
    .ifNotExists()
    .execute()

  /**
   * Compound index for entity-based filtering
   * Improves performance when querying logs for specific entities
   */
  await db.schema
    .createIndex('_sq_idx_audit_logs_entity')
    .on('_sq_audit_logs')
    .columns(['entity', 'entity_id'])
    .ifNotExists()
    .execute()

  /**
   * Index for timestamp-based queries
   * Optimizes temporal queries and log retention management
   */
  await db.schema
    .createIndex('_sq_idx_audit_logs_created')
    .on('_sq_audit_logs')
    .column('created_at')
    .ifNotExists()
    .execute()

  /**
   * Compound index for date range queries
   * Enhances performance of time-based log analysis
   */
  await db.schema
    .createIndex('_sq_idx_audit_logs_date_range')
    .on('_sq_audit_logs')
    .columns(['created_at', 'entity'])
    .ifNotExists()
    .execute()

  /**
   * Index for retention management
   * Optimizes cleanup operations based on retention policy
   */
  await db.schema
    .createIndex('_sq_idx_audit_logs_retention')
    .on('_sq_audit_logs')
    .columns(['created_at', 'retention'])
    .ifNotExists()
    .execute()
}

export const down = async (db: Kysely<Database>): Promise<void> => {
  await db.schema.dropIndex('_sq_idx_audit_logs_created').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_audit_logs_entity').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_audit_logs_organization').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_audit_logs_user').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_audit_logs_date_range').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_audit_logs_retention').ifExists().execute()
  await db.schema.dropTable('_sq_audit_logs').ifExists().execute()
}
