import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('permissions')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull().unique().check(sql`LENGTH(name) >= 3`))
    .addColumn('description', 'text')
    .addColumn('category', 'text', (col) =>
      col.notNull().check(sql`category IN ('system', 'user', 'organization', 'content')`)
    )
    .addColumn('action', 'text', (col) =>
      col.notNull().check(sql`action IN ('create', 'read', 'update', 'delete', 'manage')`)
    )
    .addColumn('resource', 'text', (col) => col.notNull())
    .addColumn('conditions', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .execute()

  // Indexes
  await db.schema.createIndex('permissions_name_idx').on('permissions').column('name').execute()
  await db.schema
    .createIndex('permissions_category_idx')
    .on('permissions')
    .column('category')
    .execute()
  await db.schema
    .createIndex('permissions_resource_action_idx')
    .on('permissions')
    .columns(['resource', 'action'])
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('permissions_resource_action_idx').ifExists().execute()
  await db.schema.dropIndex('permissions_category_idx').ifExists().execute()
  await db.schema.dropIndex('permissions_name_idx').ifExists().execute()
  await db.schema.dropTable('permissions').ifExists().execute()
}
