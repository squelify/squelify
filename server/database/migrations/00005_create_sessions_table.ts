import { type Kysely, sql } from 'kysely'
import { ISO_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('sessions')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('key_id', 'text', (col) => col.references('jwks.key_id').onDelete('restrict'))
    .addColumn('refresh_token', 'text', (col) => col.notNull())
    .addColumn('ip_address', 'text')
    .addColumn('user_agent', 'text')
    .addColumn('device_id', 'text')
    .addColumn('device_type', 'text')
    .addColumn('location', 'text')
    .addColumn('is_active', 'integer', (col) =>
      col.notNull().defaultTo(1).check(sql`is_active IN (0, 1)`)
    )
    .addColumn('expires_at', 'text', (col) => col.notNull())
    .addColumn('last_active_at', 'text')
    .addColumn('created_at', 'text', (col) => col.notNull().defaultTo(ISO_TIMESTAMP))
    .addColumn('updated_at', 'text')
    .modifyEnd(sql`STRICT`)
    .execute()

  // Indexes
  await db.schema.createIndex('sessions_user_id_idx').on('sessions').column('user_id').execute()

  await db.schema
    .createIndex('sessions_refresh_token_idx')
    .on('sessions')
    .column('refresh_token')
    .unique()
    .execute()

  await db.schema
    .createIndex('sessions_expires_at_idx')
    .on('sessions')
    .column('expires_at')
    .execute()

  await db.schema.createIndex('sessions_device_id_idx').on('sessions').column('device_id').execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('sessions_device_id_idx').ifExists().execute()
  await db.schema.dropIndex('sessions_expires_at_idx').ifExists().execute()
  await db.schema.dropIndex('sessions_refresh_token_idx').ifExists().execute()
  await db.schema.dropIndex('sessions_user_id_idx').ifExists().execute()
  await db.schema.dropTable('sessions').ifExists().execute()
}
