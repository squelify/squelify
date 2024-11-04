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
    .ifNotExists()
    .execute()

  // Create auto-update trigger
  await sql`
    CREATE TRIGGER IF NOT EXISTS update_permissions_timestamp
    AFTER UPDATE ON permissions
    FOR EACH ROW
    BEGIN
      UPDATE permissions
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  // Indexes
  await db.schema
    .createIndex('permissions_name_idx')
    .on('permissions')
    .column('name')
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('permissions_category_idx')
    .on('permissions')
    .column('category')
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('permissions_resource_action_idx')
    .on('permissions')
    .columns(['resource', 'action'])
    .ifNotExists()
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('permissions_resource_action_idx').ifExists().execute()
  await db.schema.dropIndex('permissions_category_idx').ifExists().execute()
  await db.schema.dropIndex('permissions_name_idx').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS update_permissions_timestamp;`.execute(db)
  await db.schema.dropTable('permissions').ifExists().execute()
}
