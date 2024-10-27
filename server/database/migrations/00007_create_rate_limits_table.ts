import { type Kysely, sql } from 'kysely'
import { ISO_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('rate_limits')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('key', 'text', (col) => col.notNull())
    .addColumn('context', 'text', (col) =>
      col.notNull().check(sql`context IN ('ip', 'user', 'email', 'global')`)
    )
    .addColumn('points', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('limit', 'integer', (col) => col.notNull())
    .addColumn('window', 'integer', (col) => col.notNull()) // in seconds
    .addColumn('expires_at', 'text', (col) => col.notNull())
    .addColumn('blocked_until', 'text')
    .addColumn('created_at', 'text', (col) => col.notNull().defaultTo(ISO_TIMESTAMP))
    .addColumn('updated_at', 'text')
    .modifyEnd(sql`STRICT`)
    .execute()

  // Indexes
  await db.schema
    .createIndex('rate_limits_key_context_idx')
    .on('rate_limits')
    .columns(['key', 'context'])
    .unique()
    .execute()

  await db.schema
    .createIndex('rate_limits_expires_at_idx')
    .on('rate_limits')
    .column('expires_at')
    .execute()

  await db.schema
    .createIndex('rate_limits_blocked_until_idx')
    .on('rate_limits')
    .column('blocked_until')
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('rate_limits_blocked_until_idx').ifExists().execute()
  await db.schema.dropIndex('rate_limits_expires_at_idx').ifExists().execute()
  await db.schema.dropIndex('rate_limits_key_context_idx').ifExists().execute()
  await db.schema.dropTable('rate_limits').ifExists().execute()
}
