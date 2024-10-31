import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('user_roles')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('role_id', 'text', (col) => col.notNull().references('roles.id').onDelete('cascade'))
    .addColumn('organization_id', 'text', (col) =>
      col.references('organizations.id').onDelete('cascade')
    )
    .addColumn('granted_by', 'text', (col) => col.references('users.id'))
    .addColumn('expires_at', 'integer')
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  // Create auto-update trigger
  await sql`
    CREATE TRIGGER IF NOT EXISTS update_user_roles_timestamp
    AFTER UPDATE ON user_roles
    FOR EACH ROW
    BEGIN
      UPDATE user_roles
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  // Indexes
  await db.schema
    .createIndex('user_roles_user_role_org_idx')
    .on('user_roles')
    .columns(['user_id', 'role_id', 'organization_id'])
    .unique()
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('user_roles_user_id_idx')
    .on('user_roles')
    .column('user_id')
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('user_roles_role_id_idx')
    .on('user_roles')
    .column('role_id')
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('user_roles_organization_id_idx')
    .on('user_roles')
    .column('organization_id')
    .ifNotExists()
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('user_roles_organization_id_idx').ifExists().execute()
  await db.schema.dropIndex('user_roles_role_id_idx').ifExists().execute()
  await db.schema.dropIndex('user_roles_user_id_idx').ifExists().execute()
  await db.schema.dropIndex('user_roles_user_role_org_idx').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS update_user_roles_timestamp;`.execute(db)
  await db.schema.dropTable('user_roles').ifExists().execute()
}
