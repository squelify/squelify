import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export const up = async (db: Kysely<Database>): Promise<void> => {
  await db.schema
    .createTable('sq_rate_limits')
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

  /**
   * Unique compound index for rate limit lookups
   * Ensures unique rate limit tracking per key and context
   */
  await db.schema
    .createIndex('sq_idx_rate_limits_key')
    .on('sq_rate_limits')
    .columns(['key', 'context'])
    .unique()
    .ifNotExists()
    .execute()

  /**
   * Index for cleanup and block status checks
   * Optimizes queries that manage rate limit expiration and blocking
   */
  await db.schema
    .createIndex('sq_idx_rate_limits_cleanup')
    .on('sq_rate_limits')
    .columns(['expires_at', 'blocked_until'])
    .ifNotExists()
    .execute()

  /**
   * Trigger for automatic cleanup of expired rate limits
   * Maintains database hygiene by removing expired entries
   */
  await sql`
    CREATE TRIGGER IF NOT EXISTS sq_trg_rate_limits_cleanup
    AFTER INSERT ON sq_rate_limits
    BEGIN
      DELETE FROM sq_rate_limits
      WHERE expires_at < strftime('%s', 'now')
      AND blocked_until IS NULL;
    END;
  `.execute(db)
}

export const down = async (db: Kysely<Database>): Promise<void> => {
  await db.schema.dropIndex('sq_idx_rate_limits_key').ifExists().execute()
  await db.schema.dropIndex('sq_idx_rate_limits_cleanup').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS sq_trg_rate_limits_cleanup;`.execute(db)
  await db.schema.dropTable('sq_rate_limits').ifExists().execute()
}
