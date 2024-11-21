import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('sq_passkeys')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) =>
      col.notNull().references('sq_users.id').onDelete('cascade')
    )
    .addColumn('webauthn_user_id', 'text', (col) => col.notNull())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('credential_id', 'text', (col) => col.notNull().unique())
    .addColumn('credential_public_key', 'text', (col) => col.notNull())
    .addColumn('counter', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('transports', 'text')
    .addColumn('rp_id', 'text', (col) => col.notNull())
    .addColumn('origin', 'text', (col) => col.notNull())
    .addColumn('last_used_at', 'integer')
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  /**
   * Trigger to automatically update timestamp when passkey record changes
   * Ensures accurate tracking of passkey usage and modifications
   */
  await sql`
    CREATE TRIGGER IF NOT EXISTS sq_trg_passkeys_timestamp
    AFTER UPDATE ON sq_passkeys
    FOR EACH ROW
    BEGIN
      UPDATE sq_passkeys
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  /**
   * Primary lookup index for user's passkeys
   * Optimizes queries filtering by user_id
   */
  await db.schema
    .createIndex('sq_idx_passkeys_user')
    .on('sq_passkeys')
    .column('user_id')
    .ifNotExists()
    .execute()

  /**
   * Index for credential lookups
   * Enhances WebAuthn credential validation queries
   */
  await db.schema
    .createIndex('sq_idx_passkeys_credential')
    .on('sq_passkeys')
    .column('credential_id')
    .ifNotExists()
    .execute()

  /**
   * Unique compound index for passkey names
   * Ensures unique passkey names per user
   */
  await db.schema
    .createIndex('sq_idx_passkeys_name')
    .on('sq_passkeys')
    .columns(['user_id', 'name'])
    .unique()
    .ifNotExists()
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('sq_idx_passkeys_name').ifExists().execute()
  await db.schema.dropIndex('sq_idx_passkeys_credential').ifExists().execute()
  await db.schema.dropIndex('sq_idx_passkeys_user').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS sq_trg_passkeys_timestamp;`.execute(db)
  await db.schema.dropTable('sq_passkeys').ifExists().execute()
}
