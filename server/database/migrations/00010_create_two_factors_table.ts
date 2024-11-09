import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  // Create the table with optimized structure
  await db.schema
    .createTable('two_factors')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('type', 'text', (col) => col.notNull().check(sql`type IN ('totp', 'email', 'sms')`))
    .addColumn('secret', 'text', (col) => col.notNull())
    .addColumn('backup_codes', 'text', (col) => col.notNull().defaultTo('[]'))
    .addColumn('is_primary', 'integer', (col) =>
      col.notNull().defaultTo(0).check(sql`is_primary IN (0, 1)`)
    )
    .addColumn('last_used_at', 'integer')
    .addColumn('verified_at', 'integer')
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  // Auto-update trigger
  await sql`
    CREATE TRIGGER IF NOT EXISTS update_two_factors_timestamp
    AFTER UPDATE ON two_factors
    FOR EACH ROW
    BEGIN
      UPDATE two_factors
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  // Trigger to ensure only one primary 2FA per user
  await sql`
    CREATE TRIGGER IF NOT EXISTS ensure_single_primary_2fa
    BEFORE INSERT ON two_factors
    WHEN NEW.is_primary = 1
    BEGIN
      UPDATE two_factors
      SET is_primary = 0
      WHERE user_id = NEW.user_id AND is_primary = 1;
    END;
  `.execute(db)

  // Optimized indexes
  await db.schema
    .createIndex('two_factors_user_id_idx')
    .on('two_factors')
    .column('user_id')
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('two_factors_user_type_name_idx')
    .on('two_factors')
    .columns(['user_id', 'type', 'name'])
    .unique()
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('two_factors_user_verified_idx')
    .on('two_factors')
    .columns(['user_id', 'is_verified'])
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('two_factors_primary_idx')
    .on('two_factors')
    .columns(['user_id', 'is_primary'])
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('two_factors_verified_at_idx')
    .on('two_factors')
    .column('verified_at')
    .ifNotExists()
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  // Drop all indexes
  await db.schema.dropIndex('two_factors_verified_at_idx').ifExists().execute()
  await db.schema.dropIndex('two_factors_primary_idx').ifExists().execute()
  await db.schema.dropIndex('two_factors_user_verified_idx').ifExists().execute()
  await db.schema.dropIndex('two_factors_user_type_name_idx').ifExists().execute()
  await db.schema.dropIndex('two_factors_user_id_idx').ifExists().execute()

  // Drop triggers
  await sql`DROP TRIGGER IF EXISTS ensure_single_primary_2fa;`.execute(db)
  await sql`DROP TRIGGER IF EXISTS update_two_factors_timestamp;`.execute(db)

  // Drop table
  await db.schema.dropTable('two_factors').ifExists().execute()
}
