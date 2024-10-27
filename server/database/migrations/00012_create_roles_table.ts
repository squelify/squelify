import { type Kysely, sql } from 'kysely'
import { ISO_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('roles')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull().unique().check(sql`LENGTH(name) >= 3`))
    .addColumn('description', 'text')
    .addColumn('type', 'text', (col) =>
      col.notNull().check(sql`type IN ('system', 'organization', 'custom')`)
    )
    .addColumn('organization_id', 'text', (col) =>
      col.references('organizations.id').onDelete('cascade')
    )
    .addColumn('is_default', 'integer', (col) =>
      col.notNull().defaultTo(0).check(sql`is_default IN (0, 1)`)
    )
    .addColumn('metadata', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('created_at', 'text', (col) => col.notNull().defaultTo(ISO_TIMESTAMP))
    .addColumn('updated_at', 'text')
    .modifyEnd(sql`STRICT`)
    .execute()

  // Indexes
  await db.schema
    .createIndex('roles_name_org_idx')
    .on('roles')
    .columns(['name', 'organization_id'])
    .unique()
    .execute()

  await db.schema
    .createIndex('roles_organization_id_idx')
    .on('roles')
    .column('organization_id')
    .execute()

  await db.schema.createIndex('roles_type_idx').on('roles').column('type').execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('roles_type_idx').ifExists().execute()
  await db.schema.dropIndex('roles_organization_id_idx').ifExists().execute()
  await db.schema.dropIndex('roles_name_org_idx').ifExists().execute()
  await db.schema.dropTable('roles').ifExists().execute()
}
