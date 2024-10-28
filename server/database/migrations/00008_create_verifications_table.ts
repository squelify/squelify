import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('verifications')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.references('users.id').onDelete('cascade'))
    .addColumn('type', 'text', (col) =>
      col.notNull().check(sql`type IN ('email', 'phone', 'password_reset', 'magic_link')`)
    )
    .addColumn('identifier', 'text', (col) => col.notNull())
    .addColumn('token', 'text', (col) => col.notNull())
    .addColumn('attempts', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('max_attempts', 'integer', (col) => col.notNull().defaultTo(3))
    .addColumn('expires_at', 'integer', (col) => col.notNull())
    .addColumn('verified_at', 'integer')
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .execute()

  // Indexes
  await db.schema
    .createIndex('verifications_user_id_idx')
    .on('verifications')
    .column('user_id')
    .execute()

  await db.schema
    .createIndex('verifications_token_idx')
    .on('verifications')
    .column('token')
    .unique()
    .execute()

  await db.schema
    .createIndex('verifications_identifier_type_idx')
    .on('verifications')
    .columns(['identifier', 'type'])
    .execute()

  await db.schema
    .createIndex('verifications_expires_at_idx')
    .on('verifications')
    .column('expires_at')
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('verifications_expires_at_idx').ifExists().execute()
  await db.schema.dropIndex('verifications_identifier_type_idx').ifExists().execute()
  await db.schema.dropIndex('verifications_token_idx').ifExists().execute()
  await db.schema.dropIndex('verifications_user_id_idx').ifExists().execute()
  await db.schema.dropTable('verifications').ifExists().execute()
}
