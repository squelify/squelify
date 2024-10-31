import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
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
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  // Create auto-update trigger
  await sql`
    CREATE TRIGGER IF NOT EXISTS update_roles_timestamp
    AFTER UPDATE ON roles
    FOR EACH ROW
    BEGIN
      UPDATE roles
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  // Indexes
  await db.schema
    .createIndex('roles_name_org_idx')
    .on('roles')
    .columns(['name', 'organization_id'])
    .unique()
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('roles_organization_id_idx')
    .on('roles')
    .column('organization_id')
    .ifNotExists()
    .execute()

  await db.schema.createIndex('roles_type_idx').on('roles').column('type').ifNotExists().execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('roles_type_idx').ifExists().execute()
  await db.schema.dropIndex('roles_organization_id_idx').ifExists().execute()
  await db.schema.dropIndex('roles_name_org_idx').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS update_roles_timestamp;`.execute(db)
  await db.schema.dropTable('roles').ifExists().execute()
}
