import type { Kysely } from 'kysely'
import { ISO_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('two_factor')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull().references('users.id'))
    .addColumn('secret', 'text', (col) => col.notNull())
    .addColumn('backup_codes', 'text', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) => col.defaultTo(ISO_TIMESTAMP).notNull())
    .addColumn('updated_at', 'text', (col) => col.defaultTo(ISO_TIMESTAMP).notNull())
    .execute()

  // Indexes for two_factor table
  await db.schema.createIndex('two_factor_user_id_idx').on('two_factor').column('user_id').execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('two_factor_user_id_idx').ifExists().execute()
  await db.schema.dropTable('two_factor').ifExists().execute()
}
