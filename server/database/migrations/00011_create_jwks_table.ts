import type { Kysely } from 'kysely'
import { ISO_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('jwks')
    .addColumn('id', 'text', (col) => col.primaryKey().notNull())
    .addColumn('public_key', 'text', (col) => col.notNull())
    .addColumn('private_key', 'text', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) => col.defaultTo(ISO_TIMESTAMP).notNull())
    .execute()

  // Indexes for jwks table
  await db.schema.createIndex('jwks_created_at_index').on('jwks').column('created_at').execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('jwks_created_at_index').execute()
  await db.schema.dropTable('jwks').execute()
}
