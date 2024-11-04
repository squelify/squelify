import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('audit_logs')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.references('users.id'))
    .addColumn('organization_id', 'text', (col) => col.references('organizations.id'))
    .addColumn('action', 'text', (col) => col.notNull())
    .addColumn('entity', 'text', (col) => col.notNull())
    .addColumn('entity_id', 'text', (col) => col.notNull())
    .addColumn('old_values', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('new_values', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('metadata', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('ip_address', 'text')
    .addColumn('user_agent', 'text')
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  // Indexes for audit_logs table
  await db.schema
    .createIndex('audit_logs_user_id_idx')
    .on('audit_logs')
    .column('user_id')
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('audit_logs_organization_id_idx')
    .on('audit_logs')
    .column('organization_id')
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('audit_logs_entity_idx')
    .on('audit_logs')
    .columns(['entity', 'entity_id'])
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('audit_logs_created_at_idx')
    .on('audit_logs')
    .column('created_at')
    .ifNotExists()
    .execute()

  // Index for range queries
  await db.schema
    .createIndex('audit_logs_date_range_idx')
    .on('audit_logs')
    .columns(['created_at', 'entity'])
    .ifNotExists()
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('audit_logs_created_at_idx').ifExists().execute()
  await db.schema.dropIndex('audit_logs_entity_idx').ifExists().execute()
  await db.schema.dropIndex('audit_logs_organization_id_idx').ifExists().execute()
  await db.schema.dropIndex('audit_logs_user_id_idx').ifExists().execute()
  await db.schema.dropIndex('audit_logs_date_range_idx').ifExists().execute()
  await db.schema.dropTable('audit_logs').ifExists().execute()
}
