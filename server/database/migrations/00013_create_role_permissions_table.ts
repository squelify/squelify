import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('role_permissions')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('role_id', 'text', (col) => col.notNull().references('roles.id').onDelete('cascade'))
    .addColumn('permission_id', 'text', (col) =>
      col.notNull().references('permissions.id').onDelete('cascade')
    )
    .addColumn('conditions', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('granted_by', 'text', (col) => col.references('users.id'))
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .execute()

  // Create auto-update trigger
  await sql`
    CREATE TRIGGER update_role_permissions_timestamp
    AFTER UPDATE ON role_permissions
    FOR EACH ROW
    BEGIN
      UPDATE role_permissions
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  // Indexes
  await db.schema
    .createIndex('role_permissions_role_permission_idx')
    .on('role_permissions')
    .columns(['role_id', 'permission_id'])
    .unique()
    .execute()

  await db.schema
    .createIndex('role_permissions_role_id_idx')
    .on('role_permissions')
    .column('role_id')
    .execute()

  await db.schema
    .createIndex('role_permissions_permission_id_idx')
    .on('role_permissions')
    .column('permission_id')
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('role_permissions_permission_id_idx').ifExists().execute()
  await db.schema.dropIndex('role_permissions_role_id_idx').ifExists().execute()
  await db.schema.dropIndex('role_permissions_role_permission_idx').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS update_role_permissions_timestamp;`.execute(db)
  await db.schema.dropTable('role_permissions').ifExists().execute()
}
