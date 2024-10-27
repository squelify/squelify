import { type Kysely, sql } from 'kysely'
import { ISO_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('passkey')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull().references('users.id'))
    .addColumn('name', 'text')
    .addColumn('public_key', 'text', (col) => col.notNull())
    .addColumn('webauthn_user_id', 'text', (col) => col.notNull())
    .addColumn('counter', 'integer', (col) => col.notNull())
    .addColumn('device_type', 'text', (col) => col.notNull())
    .addColumn('backed_up', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('transports', 'text')
    .addColumn('created_at', 'text', (col) => col.defaultTo(ISO_TIMESTAMP).notNull())
    .addColumn('updated_at', 'text', (col) => col.defaultTo(ISO_TIMESTAMP).notNull())
    .modifyEnd(sql`STRICT`)
    .execute()

  // Indexes for passkey table
  await db.schema.createIndex('passkey_user_id_idx').on('passkey').column('user_id').execute()
  await db.schema.createIndex('passkey_public_key_idx').on('passkey').column('public_key').execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('passkey_public_key_idx').ifExists().execute()
  await db.schema.dropIndex('passkey_user_id_idx').ifExists().execute()
  await db.schema.dropTable('passkey').ifExists().execute()
}
