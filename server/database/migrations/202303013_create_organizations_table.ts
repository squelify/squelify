import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export const up = async (db: Kysely<Database>): Promise<void> => {
  await db.schema
    .createTable('_sq_organizations')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('slug', 'text', (col) => col.notNull().unique().check(sql`LENGTH(slug) >= 3`))
    .addColumn('description', 'text')
    .addColumn('logo_url', 'text')
    .addColumn('website', 'text')
    .addColumn('email', 'text')
    .addColumn('phone', 'text')
    .addColumn('address', 'text')
    .addColumn('status', 'text', (col) =>
      col.notNull().check(sql`status IN ('active', 'inactive', 'suspended')`).defaultTo('inactive'),
    )
    .addColumn('settings', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('metadata', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('is_verified', 'integer', (col) =>
      col.notNull().defaultTo(0).check(sql`is_verified IN (0, 1)`),
    )
    .addColumn('created_by', 'text', (col) =>
      col.notNull().references('_sq_users.id').onDelete('restrict'),
    )
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  /**
   * Trigger to automatically update timestamp when organization record changes
   * Ensures accurate tracking of organization modifications
   */
  await sql`
    CREATE TRIGGER IF NOT EXISTS _sq_trg_organizations_timestamp
    AFTER UPDATE ON _sq_organizations
    FOR EACH ROW
    BEGIN
      UPDATE _sq_organizations
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  /**
   * Index for slug-based organization lookups
   * Optimizes queries that find organizations by slug
   */
  await db.schema
    .createIndex('_sq_idx_organizations_slug')
    .on('_sq_organizations')
    .column('slug')
    .ifNotExists()
    .execute()

  /**
   * Index for email-based organization lookups
   * Enhances queries that search organizations by email
   */
  await db.schema
    .createIndex('_sq_idx_organizations_email')
    .on('_sq_organizations')
    .column('email')
    .ifNotExists()
    .execute()

  /**
   * Index for verification status filtering
   * Improves performance when filtering verified organizations
   */
  await db.schema
    .createIndex('_sq_idx_organizations_verified')
    .on('_sq_organizations')
    .column('is_verified')
    .ifNotExists()
    .execute()
}

export const down = async (db: Kysely<Database>): Promise<void> => {
  await db.schema.dropIndex('_sq_idx_organizations_verified').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_organizations_email').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_organizations_slug').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS _sq_trg_organizations_timestamp;`.execute(db)
  await db.schema.dropTable('_sq_organizations').ifExists().execute()
}
