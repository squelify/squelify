import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  // Tabel untuk fallback jika Redis tidak tersedia
  await db.schema
    .createTable('rate_limits')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('key', 'text', (col) => col.notNull())
    .addColumn('context', 'text', (col) =>
      col.notNull().check(sql`context IN ('ip', 'user', 'email', 'global')`)
    )
    .addColumn('points', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('limit', 'integer', (col) => col.notNull())
    .addColumn('window', 'integer', (col) => col.notNull())
    .addColumn('expires_at', 'integer', (col) => col.notNull())
    .addColumn('blocked_until', 'integer')
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  // Optimized indexes
  await db.schema
    .createIndex('rate_limits_key_context_idx')
    .on('rate_limits')
    .columns(['key', 'context'])
    .unique()
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('rate_limits_cleanup_idx')
    .on('rate_limits')
    .columns(['expires_at', 'blocked_until'])
    .ifNotExists()
    .execute()

  // Cleanup trigger untuk expired records
  await sql`
    CREATE TRIGGER IF NOT EXISTS cleanup_rate_limits
    AFTER INSERT ON rate_limits
    BEGIN
      DELETE FROM rate_limits
      WHERE expires_at < strftime('%s', 'now')
      AND blocked_until IS NULL;
    END;
  `.execute(db)
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('rate_limits_key_context_idx').ifExists().execute()
  await db.schema.dropIndex('rate_limits_cleanup_idx').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS cleanup_rate_limits;`.execute(db)
  await db.schema.dropTable('rate_limits').ifExists().execute()
}
