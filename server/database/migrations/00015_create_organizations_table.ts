import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('organizations')
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
      col.notNull().check(sql`status IN ('active', 'inactive', 'suspended')`).defaultTo('inactive')
    )
    .addColumn('settings', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('metadata', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('is_verified', 'integer', (col) =>
      col.notNull().defaultTo(0).check(sql`is_verified IN (0, 1)`)
    )
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .execute()

  // Create auto-update trigger
  await sql`
    CREATE TRIGGER update_organizations_timestamp
    AFTER UPDATE ON organizations
    FOR EACH ROW
    BEGIN
      UPDATE organizations
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  // Indexes
  await db.schema.createIndex('organizations_slug_idx').on('organizations').column('slug').execute()
  await db.schema
    .createIndex('organizations_email_idx')
    .on('organizations')
    .column('email')
    .execute()
  await db.schema
    .createIndex('organizations_is_verified_idx')
    .on('organizations')
    .column('is_verified')
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('organizations_is_verified_idx').ifExists().execute()
  await db.schema.dropIndex('organizations_email_idx').ifExists().execute()
  await db.schema.dropIndex('organizations_slug_idx').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS update_organizations_timestamp;`.execute(db)
  await db.schema.dropTable('organizations').ifExists().execute()
}
