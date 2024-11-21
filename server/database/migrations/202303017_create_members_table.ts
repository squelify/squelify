import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export const up = async (db: Kysely<Database>): Promise<void> => {
  await db.schema
    .createTable('sq_members')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('organization_id', 'text', (col) =>
      col.notNull().references('sq_organizations.id').onDelete('cascade')
    )
    .addColumn('user_id', 'text', (col) =>
      col.notNull().references('sq_users.id').onDelete('cascade')
    )
    .addColumn('role', 'text', (col) =>
      col.notNull().check(sql`role IN ('org:owner', 'org:admin', 'org:member')`)
    )
    .addColumn('title', 'text')
    .addColumn('department', 'text')
    .addColumn('invited_by', 'text', (col) => col.references('sq_users.id'))
    .addColumn('invited_at', 'integer')
    .addColumn('joined_at', 'integer')
    .addColumn('is_default', 'integer', (col) =>
      col.notNull().defaultTo(0).check(sql`is_default IN (0, 1)`)
    )
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  /**
   * Trigger to automatically update timestamp when member record changes
   * Ensures accurate tracking of membership modifications
   */
  await sql`
    CREATE TRIGGER IF NOT EXISTS sq_trg_members_timestamp
    AFTER UPDATE ON sq_members
    FOR EACH ROW
    BEGIN
      UPDATE sq_members
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  /**
   * Unique compound index for organization membership
   * Prevents duplicate memberships for users in organizations
   */
  await db.schema
    .createIndex('sq_idx_members_org_user')
    .on('sq_members')
    .columns(['organization_id', 'user_id'])
    .unique()
    .ifNotExists()
    .execute()

  /**
   * Index for organization-based member lookups
   * Optimizes queries that fetch members of an organization
   */
  await db.schema
    .createIndex('sq_idx_members_organization')
    .on('sq_members')
    .column('organization_id')
    .ifNotExists()
    .execute()

  /**
   * Index for user-based membership lookups
   * Enhances queries that find user memberships
   */
  await db.schema
    .createIndex('sq_idx_members_user')
    .on('sq_members')
    .column('user_id')
    .ifNotExists()
    .execute()

  /**
   * Index for role-based filtering
   * Improves performance when filtering members by role
   */
  await db.schema
    .createIndex('sq_idx_members_role')
    .on('sq_members')
    .column('role')
    .ifNotExists()
    .execute()

  /**
   * Compound index for user role lookups
   * Optimizes queries that check user roles across organizations
   */
  await db.schema
    .createIndex('sq_idx_members_user_role')
    .on('sq_members')
    .columns(['user_id', 'role'])
    .ifNotExists()
    .execute()
}

export const down = async (db: Kysely<Database>): Promise<void> => {
  await db.schema.dropIndex('sq_idx_members_role').ifExists().execute()
  await db.schema.dropIndex('sq_idx_members_user').ifExists().execute()
  await db.schema.dropIndex('sq_idx_members_organization').ifExists().execute()
  await db.schema.dropIndex('sq_idx_members_org_user').ifExists().execute()
  await db.schema.dropIndex('sq_idx_members_user_role').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS sq_trg_members_timestamp;`.execute(db)
  await db.schema.dropTable('sq_members').ifExists().execute()
}
