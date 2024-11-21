import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('sq_sessions')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) =>
      col.notNull().references('sq_users.id').onDelete('cascade')
    )
    .addColumn('key_id', 'text', (col) => col.references('sq_jwks.id').onDelete('restrict'))
    .addColumn('refresh_token', 'text', (col) => col.notNull())
    .addColumn('ip_address', 'text')
    .addColumn('user_agent', 'text')
    .addColumn('device_id', 'text')
    .addColumn('device_type', 'text')
    .addColumn('location', 'text')
    .addColumn('is_active', 'integer', (col) =>
      col.notNull().defaultTo(1).check(sql`is_active IN (0, 1)`)
    )
    .addColumn('expires_at', 'integer', (col) => col.notNull())
    .addColumn('last_active_at', 'integer')
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .addColumn('archived_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  /**
   * Index for session cleanup operations
   * Optimizes queries that handle session expiration and cleanup
   */
  await db.schema
    .createIndex('sq_idx_sessions_cleanup')
    .on('sq_sessions')
    .columns(['is_active', 'expires_at'])
    .ifNotExists()
    .execute()

  /**
   * Index for session archival operations
   * Enhances queries that manage archived sessions
   */
  await db.schema
    .createIndex('sq_idx_sessions_archive')
    .on('sq_sessions')
    .columns(['archived_at', 'created_at'])
    .ifNotExists()
    .execute()

  /**
   * Trigger to automatically cleanup expired sessions
   * Maintains session hygiene by marking expired sessions as inactive
   */
  await sql`
    CREATE TRIGGER IF NOT EXISTS sq_trg_sessions_cleanup
    AFTER UPDATE ON sq_sessions
    FOR EACH ROW
    WHEN NEW.expires_at < strftime('%s', 'now')
    BEGIN
      UPDATE sq_sessions
      SET
        is_active = 0,
        archived_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('sq_idx_sessions_cleanup').ifExists().execute()
  await db.schema.dropIndex('sq_idx_sessions_archive').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS sq_trg_sessions_cleanup;`.execute(db)
  await db.schema.dropTable('sq_sessions').ifExists().execute()
}
