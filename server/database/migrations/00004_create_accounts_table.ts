import type { Kysely } from 'kysely'
import { ISO_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('accounts')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull().references('users.id'))
    .addColumn('provider_id', 'text', (col) => col.notNull()) // credential, google, github, etc
    .addColumn('account_id', 'text', (col) => col.notNull()) // userId from provider
    .addColumn('access_token', 'text') // for credential, google, github, etc
    .addColumn('refresh_token', 'text') // for credential, google, github, etc
    .addColumn('id_token', 'text') // for credential, google, github, etc
    .addColumn('password', 'text')
    .addColumn('token_expires_at', 'date')
    .addColumn('created_at', 'text', (col) => col.defaultTo(ISO_TIMESTAMP).notNull())
    .addColumn('updated_at', 'text', (col) => col.defaultTo(ISO_TIMESTAMP).notNull())
    .execute()

  // Indexes for account table
  await db.schema.createIndex('accounts_user_id_idx').on('accounts').column('user_id').execute()
  await db.schema
    .createIndex('accounts_provider_id_idx')
    .on('accounts')
    .column('provider_id')
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('accounts_provider_id_idx').ifExists().execute()
  await db.schema.dropIndex('accounts_user_id_idx').ifExists().execute()
  await db.schema.dropTable('accounts').ifExists().execute()
}
