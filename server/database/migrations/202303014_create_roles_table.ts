import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export const up = async (db: Kysely<Database>): Promise<void> => {
  await db.schema
    .createTable('_sq_roles')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull().unique().check(sql`LENGTH(name) >= 3`))
    .addColumn('description', 'text')
    .addColumn('type', 'text', (col) =>
      col.notNull().check(sql`type IN ('system', 'organization', 'custom')`)
    )
    .addColumn('organization_id', 'text', (col) =>
      col.references('_sq_organizations.id').onDelete('cascade')
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

  /**
   * Trigger to automatically update timestamp when role record changes
   * Ensures accurate tracking of role modifications
   */
  await sql`
    CREATE TRIGGER IF NOT EXISTS _sq_trg_roles_timestamp
    AFTER UPDATE ON _sq_roles
    FOR EACH ROW
    BEGIN
      UPDATE _sq_roles
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  /**
   * Unique compound index for role names within organizations
   * Ensures unique role names per organization context
   */
  await db.schema
    .createIndex('_sq_idx_roles_name_org')
    .on('_sq_roles')
    .columns(['name', 'organization_id'])
    .unique()
    .ifNotExists()
    .execute()

  /**
   * Index for organization-based role filtering
   * Optimizes queries that filter roles by organization
   */
  await db.schema
    .createIndex('_sq_idx_roles_organization')
    .on('_sq_roles')
    .column('organization_id')
    .ifNotExists()
    .execute()

  /**
   * Index for role type filtering
   * Enhances queries that filter roles by type
   */
  await db.schema
    .createIndex('_sq_idx_roles_type')
    .on('_sq_roles')
    .column('type')
    .ifNotExists()
    .execute()
}

export const down = async (db: Kysely<Database>): Promise<void> => {
  await db.schema.dropIndex('_sq_idx_roles_type').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_roles_organization').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_roles_name_org').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS _sq_trg_roles_timestamp;`.execute(db)
  await db.schema.dropTable('_sq_roles').ifExists().execute()
}
