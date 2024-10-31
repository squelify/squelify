import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('two_factors')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('name', 'text', (col) => col.notNull().unique())
    .addColumn('type', 'text', (col) => col.notNull().check(sql`type IN ('totp', 'email', 'sms')`))
    .addColumn('secret', 'text', (col) => col.notNull())
    .addColumn('backup_codes', 'text', (col) => col.notNull().defaultTo('[]'))
    .addColumn('last_used_at', 'integer')
    .addColumn('is_verified', 'integer', (col) =>
      col.notNull().defaultTo(0).check(sql`is_verified IN (0, 1)`)
    )
    .addColumn('is_primary', 'integer', (col) =>
      col.notNull().defaultTo(0).check(sql`is_primary IN (0, 1)`)
    )
    .addColumn('verified_at', 'integer')
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .execute()

  // Create auto-update trigger
  await sql`
    CREATE TRIGGER update_two_factors_timestamp
    AFTER UPDATE ON two_factors
    FOR EACH ROW
    BEGIN
      UPDATE two_factors
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  // Indexes
  await db.schema
    .createIndex('two_factors_user_id_idx')
    .on('two_factors')
    .column('user_id')
    .execute()

  await db.schema
    .createIndex('two_factors_user_type_name_idx')
    .on('two_factors')
    .columns(['user_id', 'type', 'name'])
    .unique()
    .execute()

  await db.schema
    .createIndex('two_factors_is_primary_idx')
    .on('two_factors')
    .column('is_primary')
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('two_factors_is_primary_idx').ifExists().execute()
  await db.schema.dropIndex('two_factors_user_type_name_idx').ifExists().execute()
  await db.schema.dropIndex('two_factors_user_id_idx').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS update_two_factors_timestamp;`.execute(db)
  await db.schema.dropTable('two_factors').ifExists().execute()
}
