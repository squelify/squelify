import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export const up = async (db: Kysely<Database>): Promise<void> => {
  await db.schema
    .createTable('_sq_user_roles')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) =>
      col.notNull().references('_sq_users.id').onDelete('cascade'),
    )
    .addColumn('role_id', 'text', (col) =>
      col.notNull().references('_sq_roles.id').onDelete('cascade'),
    )
    .addColumn('organization_id', 'text', (col) =>
      col.references('_sq_organizations.id').onDelete('cascade'),
    )
    .addColumn('granted_by', 'text', (col) => col.references('_sq_users.id'))
    .addColumn('expires_at', 'integer')
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  /**
   * Trigger to automatically update timestamp when user role assignment changes
   * Ensures accurate tracking of role assignments
   */
  await sql`
    CREATE TRIGGER IF NOT EXISTS _sq_trg_user_roles_timestamp
    AFTER UPDATE ON _sq_user_roles
    FOR EACH ROW
    BEGIN
      UPDATE _sq_user_roles
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  /**
   * Unique compound index for user role assignments
   * Prevents duplicate role assignments within organizations
   */
  await db.schema
    .createIndex('_sq_idx_user_roles_assignment')
    .on('_sq_user_roles')
    .columns(['user_id', 'role_id', 'organization_id'])
    .unique()
    .ifNotExists()
    .execute()

  /**
   * Index for user-based role lookups
   * Optimizes queries that fetch roles for a user
   */
  await db.schema
    .createIndex('_sq_idx_user_roles_user')
    .on('_sq_user_roles')
    .column('user_id')
    .ifNotExists()
    .execute()

  /**
   * Index for role-based user lookups
   * Enhances queries that find users with specific roles
   */
  await db.schema
    .createIndex('_sq_idx_user_roles_role')
    .on('_sq_user_roles')
    .column('role_id')
    .ifNotExists()
    .execute()

  /**
   * Index for organization-based role assignments
   * Improves performance when filtering roles by organization
   */
  await db.schema
    .createIndex('_sq_idx_user_roles_organization')
    .on('_sq_user_roles')
    .column('organization_id')
    .ifNotExists()
    .execute()
}

export const down = async (db: Kysely<Database>): Promise<void> => {
  await db.schema.dropIndex('_sq_idx_user_roles_organization').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_user_roles_role').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_user_roles_user').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_user_roles_assignment').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS _sq_trg_user_roles_timestamp;`.execute(db)
  await db.schema.dropTable('_sq_user_roles').ifExists().execute()
}
