import { type Kysely, sql } from 'kysely'
import { ISO_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('passkeys')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('credential_id', 'text', (col) => col.notNull().unique())
    .addColumn('public_key', 'text', (col) => col.notNull())
    .addColumn('sign_count', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('transports', 'text')
    .addColumn('attestation_format', 'text')
    .addColumn('aaguid', 'text')
    .addColumn('credential_device_type', 'text', (col) =>
      col.notNull().check(sql`credential_device_type IN ('platform', 'cross-platform')`)
    )
    .addColumn('credential_backed_up', 'integer', (col) =>
      col.notNull().defaultTo(0).check(sql`credential_backed_up IN (0, 1)`)
    )
    .addColumn('last_used_at', 'text')
    .addColumn('created_at', 'text', (col) => col.notNull().defaultTo(ISO_TIMESTAMP))
    .addColumn('updated_at', 'text')
    .modifyEnd(sql`STRICT`)
    .execute()

  // Indexes
  await db.schema.createIndex('passkeys_user_id_idx').on('passkeys').column('user_id').execute()

  await db.schema
    .createIndex('passkeys_credential_id_idx')
    .on('passkeys')
    .column('credential_id')
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('passkeys_credential_id_idx').ifExists().execute()
  await db.schema.dropIndex('passkeys_user_id_idx').ifExists().execute()
  await db.schema.dropTable('passkeys').ifExists().execute()
}
