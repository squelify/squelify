import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export const up = async (db: Kysely<Database>): Promise<void> => {
  await db.schema
    .createTable('_sq_permissions')
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

  /**
   * Trigger to automatically update timestamp when permission record changes
   * Ensures accurate tracking of permission modifications
   */
  await sql`
    CREATE TRIGGER IF NOT EXISTS _sq_trg_permissions_timestamp
    AFTER UPDATE ON _sq_permissions
    FOR EACH ROW
    BEGIN
      UPDATE _sq_permissions
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  /**
   * Index for permission name lookups
   * Optimizes permission validation queries
   */
  await db.schema
    .createIndex('_sq_idx_permissions_name')
    .on('_sq_permissions')
    .column('name')
    .ifNotExists()
    .execute()

  /**
   * Index for category-based filtering
   * Enhances queries that filter permissions by category
   */
  await db.schema
    .createIndex('_sq_idx_permissions_category')
    .on('_sq_permissions')
    .column('category')
    .ifNotExists()
    .execute()

  /**
   * Compound index for resource-action lookups
   * Improves performance of permission checking queries
   */
  await db.schema
    .createIndex('_sq_idx_permissions_resource_action')
    .on('_sq_permissions')
    .columns(['resource', 'action'])
    .ifNotExists()
    .execute()
}

export const down = async (db: Kysely<Database>): Promise<void> => {
  await db.schema.dropIndex('_sq_idx_permissions_resource_action').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_permissions_category').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_permissions_name').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS _sq_trg_permissions_timestamp;`.execute(db)
  await db.schema.dropTable('_sq_permissions').ifExists().execute()
}
