import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('sessions')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('key_id', 'text', (col) => col.references('jwks.id').onDelete('restrict'))
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
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  // Create auto-update trigger
  await sql`
    CREATE TRIGGER IF NOT EXISTS update_sessions_timestamp
    AFTER UPDATE ON sessions
    FOR EACH ROW
    BEGIN
      UPDATE sessions
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  // Indexes
  await db.schema
    .createIndex('sessions_user_id_idx')
    .on('sessions')
    .column('user_id')
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('sessions_refresh_token_idx')
    .on('sessions')
    .column('refresh_token')
    .unique()
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('sessions_expires_at_idx')
    .on('sessions')
    .column('expires_at')
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('sessions_device_id_idx')
    .on('sessions')
    .column('device_id')
    .ifNotExists()
    .execute()

  // Index untuk session cleanup
  await db.schema
    .createIndex('sessions_cleanup_idx')
    .on('sessions')
    .columns(['is_active', 'expires_at'])
    .ifNotExists()
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('sessions_device_id_idx').ifExists().execute()
  await db.schema.dropIndex('sessions_expires_at_idx').ifExists().execute()
  await db.schema.dropIndex('sessions_refresh_token_idx').ifExists().execute()
  await db.schema.dropIndex('sessions_user_id_idx').ifExists().execute()
  await db.schema.dropIndex('sessions_cleanup_idx').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS update_sessions_timestamp;`.execute(db)
  await db.schema.dropTable('sessions').ifExists().execute()
}
