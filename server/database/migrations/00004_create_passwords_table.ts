import { type Kysely, sql } from 'kysely'
import { ISO_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('passwords')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('hash', 'text', (col) => col.notNull())
    .addColumn('algorithm', 'text', (col) =>
      col.notNull().defaultTo('argon2id').check(sql`algorithm IN ('argon2id', 'bcrypt', 'scrypt')`)
    )
    .addColumn('reset_token', 'text')
    .addColumn('reset_token_expires_at', 'text')
    .addColumn('last_changed_at', 'text')
    .addColumn('created_at', 'text', (col) => col.notNull().defaultTo(ISO_TIMESTAMP))
    .addColumn('updated_at', 'text')
    .modifyEnd(sql`STRICT`)
    .execute()

  // Indexes
  await db.schema.createIndex('passwords_user_id_idx').on('passwords').column('user_id').execute()

  await db.schema
    .createIndex('passwords_reset_token_idx')
    .on('passwords')
    .column('reset_token')
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('passwords_reset_token_idx').ifExists().execute()
  await db.schema.dropIndex('passwords_user_id_idx').ifExists().execute()
  await db.schema.dropTable('passwords').ifExists().execute()
}
