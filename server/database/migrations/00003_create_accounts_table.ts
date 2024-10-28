import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('accounts')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('provider', 'text')
    .addColumn('provider_account_id', 'text', (col) => col.notNull())
    .addColumn('provider_refresh_token', 'text')
    .addColumn('provider_access_token', 'text')
    .addColumn('provider_id_token', 'text')
    .addColumn('provider_scope', 'text')
    .addColumn('provider_token_type', 'text')
    .addColumn('provider_expires_at', 'integer')
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .execute()

  // Create auto-update trigger
  await sql`
    CREATE TRIGGER update_accounts_timestamp
    AFTER UPDATE ON accounts
    FOR EACH ROW
    BEGIN
      UPDATE accounts
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  // Indexes
  await db.schema.createIndex('accounts_user_id_idx').on('accounts').column('user_id').execute()
  await db.schema
    .createIndex('accounts_provider_account_id_idx')
    .on('accounts')
    .columns(['provider', 'provider_account_id'])
    .unique()
    .execute()
  await db.schema.createIndex('accounts_provider_idx').on('accounts').column('provider').execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('accounts_provider_idx').ifExists().execute()
  await db.schema.dropIndex('accounts_provider_account_id_idx').ifExists().execute()
  await db.schema.dropIndex('accounts_user_id_idx').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS update_accounts_timestamp;`.execute(db)
  await db.schema.dropTable('accounts').ifExists().execute()
}
