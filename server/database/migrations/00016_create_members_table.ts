import { type Kysely, sql } from 'kysely'
import { ISO_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('members')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('organization_id', 'text', (col) =>
      col.notNull().references('organizations.id').onDelete('cascade')
    )
    .addColumn('user_id', 'text', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('role', 'text', (col) =>
      col.notNull().check(sql`role IN ('owner', 'admin', 'member')`)
    )
    .addColumn('title', 'text')
    .addColumn('department', 'text')
    .addColumn('invited_by', 'text', (col) => col.references('users.id'))
    .addColumn('invited_at', 'text')
    .addColumn('joined_at', 'text')
    .addColumn('is_default', 'integer', (col) =>
      col.notNull().defaultTo(0).check(sql`is_default IN (0, 1)`)
    )
    .addColumn('created_at', 'text', (col) => col.notNull().defaultTo(ISO_TIMESTAMP))
    .addColumn('updated_at', 'text')
    .modifyEnd(sql`STRICT`)
    .execute()

  // Indexes
  await db.schema
    .createIndex('members_org_user_idx')
    .on('members')
    .columns(['organization_id', 'user_id'])
    .unique()
    .execute()

  await db.schema
    .createIndex('members_organization_id_idx')
    .on('members')
    .column('organization_id')
    .execute()

  await db.schema.createIndex('members_user_id_idx').on('members').column('user_id').execute()

  await db.schema.createIndex('members_role_idx').on('members').column('role').execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('members_role_idx').ifExists().execute()
  await db.schema.dropIndex('members_user_id_idx').ifExists().execute()
  await db.schema.dropIndex('members_organization_id_idx').ifExists().execute()
  await db.schema.dropIndex('members_org_user_idx').ifExists().execute()
  await db.schema.dropTable('members').ifExists().execute()
}
