import { type Kysely, sql } from 'kysely'
import { ISO_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('members')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('organization_id', 'text', (col) => col.notNull().references('organizations.id'))
    .addColumn('user_id', 'text', (col) => col.notNull())
    .addColumn('email', 'text', (col) => col.notNull())
    .addColumn('role', 'text', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) => col.defaultTo(ISO_TIMESTAMP).notNull())
    .modifyEnd(sql`STRICT`)
    .execute()

  // Indexes for member table
  await db.schema
    .createIndex('members_organization_id_idx')
    .on('members')
    .column('organization_id')
    .execute()

  await db.schema.createIndex('members_user_id_idx').on('members').column('user_id').execute()
  await db.schema.createIndex('members_email_idx').on('members').column('email').execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('members_email_idx').ifExists().execute()
  await db.schema.dropIndex('members_user_id_idx').ifExists().execute()
  await db.schema.dropIndex('members_organization_id_idx').ifExists().execute()
  await db.schema.dropTable('members').ifExists().execute()
}
