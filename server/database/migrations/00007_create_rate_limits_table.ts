import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
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
    .addColumn('expires_at', 'integer', (col) => col.notNull())
    .addColumn('blocked_until', 'integer')
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  // Create auto-update trigger
  await sql`
    CREATE TRIGGER IF NOT EXISTS update_rate_limits_timestamp
    AFTER UPDATE ON rate_limits
    FOR EACH ROW
    BEGIN
      UPDATE rate_limits
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  // Indexes
  await db.schema
    .createIndex('rate_limits_key_context_idx')
    .on('rate_limits')
    .columns(['key', 'context'])
    .unique()
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('rate_limits_expires_at_idx')
    .on('rate_limits')
    .column('expires_at')
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('rate_limits_blocked_until_idx')
    .on('rate_limits')
    .column('blocked_until')
    .ifNotExists()
    .execute()

  // Index for rate limit checks
  await db.schema
    .createIndex('rate_limits_check_idx')
    .on('rate_limits')
    .columns(['key', 'context', 'expires_at'])
    .ifNotExists()
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('rate_limits_blocked_until_idx').ifExists().execute()
  await db.schema.dropIndex('rate_limits_expires_at_idx').ifExists().execute()
  await db.schema.dropIndex('rate_limits_key_context_idx').ifExists().execute()
  await db.schema.dropIndex('rate_limits_check_idx').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS update_rate_limits_timestamp;`.execute(db)
  await db.schema.dropTable('rate_limits').ifExists().execute()
}
