import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export const up = async (db: Kysely<Database>): Promise<void> => {
  await db.schema
    .createTable('_sq_accounts')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) =>
      col.notNull().references('_sq_users.id').onDelete('cascade')
    )
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
    .ifNotExists()
    .execute()

  /**
   * Trigger to automatically update timestamp when OAuth account is modified
   * Ensures accurate tracking of account changes and token updates
   */
  await sql`
    CREATE TRIGGER IF NOT EXISTS _sq_trg_accounts_timestamp
    AFTER UPDATE ON _sq_accounts
    FOR EACH ROW
    BEGIN
      UPDATE _sq_accounts
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  /**
   * Primary lookup index for user's OAuth accounts
   * Optimizes queries filtering by user_id
   */
  await db.schema
    .createIndex('_sq_idx_accounts_user')
    .on('_sq_accounts')
    .column('user_id')
    .ifNotExists()
    .execute()

  /**
   * Unique compound index for provider account lookups
   * Ensures unique provider accounts and improves authentication queries
   */
  await db.schema
    .createIndex('_sq_idx_accounts_provider_lookup')
    .on('_sq_accounts')
    .columns(['provider', 'provider_account_id'])
    .unique()
    .ifNotExists()
    .execute()

  /**
   * Index for provider-based filtering
   * Enhances queries that filter accounts by OAuth provider
   */
  await db.schema
    .createIndex('_sq_idx_accounts_provider')
    .on('_sq_accounts')
    .column('provider')
    .ifNotExists()
    .execute()
}

export const down = async (db: Kysely<Database>): Promise<void> => {
  await db.schema.dropIndex('_sq_idx_accounts_provider').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_accounts_provider_lookup').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_accounts_user').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS _sq_trg_accounts_timestamp;`.execute(db)
  await db.schema.dropTable('_sq_accounts').ifExists().execute()
}
