import { type Kysely, sql } from 'kysely'
import { ISO_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('organizations')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('logo', 'text')
    .addColumn('metadata', 'text')
    .addColumn('created_at', 'text', (col) => col.defaultTo(ISO_TIMESTAMP).notNull())
    .addColumn('updated_at', 'text', (col) => col.defaultTo(ISO_TIMESTAMP).notNull())
    .modifyEnd(sql`STRICT`)
    .execute()

  // Index for organization table
  await db.schema.createIndex('organizations_slug_idx').on('organizations').column('slug').execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('organizations_slug_idx').ifExists().execute()
  await db.schema.dropTable('organizations').ifExists().execute()
}
