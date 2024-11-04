import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('passkeys')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull().references('users.id').onDelete('cascade'))
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

  // Create auto-update trigger
  await sql`
    CREATE TRIGGER IF NOT EXISTS update_passkeys_timestamp
    AFTER UPDATE ON passkeys
    FOR EACH ROW
    BEGIN
      UPDATE passkeys
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  // Indexes
  await db.schema
    .createIndex('passkeys_user_id_idx')
    .on('passkeys')
    .column('user_id')
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('passkeys_credential_id_idx')
    .on('passkeys')
    .column('credential_id')
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('passkeys_user_name_idx')
    .on('passkeys')
    .columns(['user_id', 'name'])
    .unique()
    .ifNotExists()
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('passkeys_user_name_idx').ifExists().execute()
  await db.schema.dropIndex('passkeys_credential_id_idx').ifExists().execute()
  await db.schema.dropIndex('passkeys_user_id_idx').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS update_passkeys_timestamp;`.execute(db)
  await db.schema.dropTable('passkeys').ifExists().execute()
}
