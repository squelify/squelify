import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export const up = async (db: Kysely<Database>): Promise<void> => {
  await db.schema
    .createTable('_sq_api_keys')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) =>
      col.notNull().references('_sq_users.id').onDelete('cascade')
    )
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('key', 'text', (col) => col.notNull().unique())
    .addColumn('hash', 'text', (col) => col.notNull())
    .addColumn('last_used_at', 'integer')
    .addColumn('expires_at', 'integer')
    .addColumn('is_active', 'integer', (col) =>
      col.notNull().defaultTo(1).check(sql`is_active IN (0, 1)`)
    )
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  await sql`
    CREATE TRIGGER IF NOT EXISTS _sq_trg_api_keys_timestamp
    AFTER UPDATE ON _sq_api_keys
    FOR EACH ROW
    BEGIN
      UPDATE _sq_api_keys
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  await db.schema
    .createIndex('_sq_idx_api_keys_user')
    .on('_sq_api_keys')
    .column('user_id')
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('_sq_idx_api_keys_active')
    .on('_sq_api_keys')
    .columns(['is_active', 'expires_at'])
    .ifNotExists()
    .execute()
}

export const down = async (db: Kysely<Database>): Promise<void> => {
  await db.schema.dropIndex('_sq_idx_api_keys_active').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_api_keys_user').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS _sq_trg_api_keys_timestamp;`.execute(db)
  await db.schema.dropTable('_sq_api_keys').ifExists().execute()
}
