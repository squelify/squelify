import { type Kysely, sql } from 'kysely'
import { ISO_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('verifications')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('identifier', 'text', (col) => col.notNull())
    .addColumn('value', 'text', (col) => col.notNull())
    .addColumn('expires_at', 'text', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) => col.defaultTo(ISO_TIMESTAMP).notNull())
    .modifyEnd(sql`STRICT`)
    .execute()

  // Indexes for verification table
  await db.schema
    .createIndex('verifications_identifier_idx')
    .on('verifications')
    .column('identifier')
    .execute()

  await db.schema
    .createIndex('verifications_expires_at_idx')
    .on('verifications')
    .column('expires_at')
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('verifications_expires_at_idx').ifExists().execute()
  await db.schema.dropIndex('verifications_identifier_idx').ifExists().execute()
  await db.schema.dropTable('verifications').ifExists().execute()
}
