import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('invitations')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('organization_id', 'text', (col) =>
      col.notNull().references('organizations.id').onDelete('cascade')
    )
    .addColumn('email', 'text', (col) => col.notNull())
    .addColumn('role', 'text', (col) => col.notNull().check(sql`role IN ('admin', 'member')`))
    .addColumn('token', 'text', (col) => col.notNull().unique())
    .addColumn('invited_by', 'text', (col) => col.notNull().references('users.id'))
    .addColumn('status', 'text', (col) =>
      col
        .notNull()
        .defaultTo('pending')
        .check(sql`status IN ('pending', 'accepted', 'expired', 'revoked')`)
    )
    .addColumn('expires_at', 'integer', (col) => col.notNull())
    .addColumn('accepted_at', 'integer')
    .addColumn('metadata', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .execute()

  // Indexes
  await db.schema
    .createIndex('invitations_org_email_idx')
    .on('invitations')
    .columns(['organization_id', 'email'])
    .execute()

  await db.schema.createIndex('invitations_token_idx').on('invitations').column('token').execute()
  await db.schema.createIndex('invitations_status_idx').on('invitations').column('status').execute()
  await db.schema
    .createIndex('invitations_expires_at_idx')
    .on('invitations')
    .column('expires_at')
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('invitations_expires_at_idx').ifExists().execute()
  await db.schema.dropIndex('invitations_status_idx').ifExists().execute()
  await db.schema.dropIndex('invitations_token_idx').ifExists().execute()
  await db.schema.dropIndex('invitations_org_email_idx').ifExists().execute()
  await db.schema.dropTable('invitations').ifExists().execute()
}
