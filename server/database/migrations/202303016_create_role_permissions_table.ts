import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export const up = async (db: Kysely<Database>): Promise<void> => {
  await db.schema
    .createTable('_sq_role_permissions')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('role_id', 'text', (col) =>
      col.notNull().references('_sq_roles.id').onDelete('cascade')
    )
    .addColumn('permission_id', 'text', (col) =>
      col.notNull().references('_sq_permissions.id').onDelete('cascade')
    )
    .addColumn('conditions', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('granted_by', 'text', (col) => col.references('_sq_users.id'))
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  /**
   * Trigger to automatically update timestamp when role permission changes
   * Ensures accurate tracking of permission assignments
   */
  await sql`
    CREATE TRIGGER IF NOT EXISTS _sq_trg_role_permissions_timestamp
    AFTER UPDATE ON _sq_role_permissions
    FOR EACH ROW
    BEGIN
      UPDATE _sq_role_permissions
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  /**
   * Unique compound index for role-permission pairs
   * Prevents duplicate permission assignments to roles
   */
  await db.schema
    .createIndex('_sq_idx_role_permissions_pair')
    .on('_sq_role_permissions')
    .columns(['role_id', 'permission_id'])
    .unique()
    .ifNotExists()
    .execute()

  /**
   * Index for role-based permission lookups
   * Optimizes queries that fetch permissions for a role
   */
  await db.schema
    .createIndex('_sq_idx_role_permissions_role')
    .on('_sq_role_permissions')
    .column('role_id')
    .ifNotExists()
    .execute()

  /**
   * Index for permission-based role lookups
   * Enhances queries that find roles with specific permissions
   */
  await db.schema
    .createIndex('_sq_idx_role_permissions_permission')
    .on('_sq_role_permissions')
    .column('permission_id')
    .ifNotExists()
    .execute()
}

export const down = async (db: Kysely<Database>): Promise<void> => {
  await db.schema.dropIndex('_sq_idx_role_permissions_permission').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_role_permissions_role').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_role_permissions_pair').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS _sq_trg_role_permissions_timestamp;`.execute(db)
  await db.schema.dropTable('_sq_role_permissions').ifExists().execute()
}
