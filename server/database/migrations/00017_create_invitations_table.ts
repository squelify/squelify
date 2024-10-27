import { type Kysely, sql } from 'kysely'
import { ISO_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('invitations')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('organization_id', 'text', (col) => col.notNull().references('organizations.id'))
    .addColumn('inviter_id', 'text', (col) => col.notNull().references('users.id'))
    .addColumn('email', 'text', (col) => col.notNull())
    .addColumn('role', 'text')
    .addColumn('status', 'text', (col) => col.notNull())
    .addColumn('expires_at', 'text', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) => col.defaultTo(ISO_TIMESTAMP).notNull())
    .modifyEnd(sql`STRICT`)
    .execute()

  // Indexes for invitation table
  await db.schema
    .createIndex('invitations_organization_id_idx')
    .on('invitations')
    .column('organization_id')
    .execute()

  await db.schema.createIndex('invitations_email_idx').on('invitations').column('email').execute()
  await db.schema.createIndex('invitations_status_idx').on('invitations').column('status').execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('invitations_status_idx').ifExists().execute()
  await db.schema.dropIndex('invitations_email_idx').ifExists().execute()
  await db.schema.dropIndex('invitations_organization_id_idx').ifExists().execute()
  await db.schema.dropTable('invitations').ifExists().execute()
}
