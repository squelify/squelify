import { type Kysely, sql } from 'kysely'
import { ISO_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('email', 'text', (col) => col.notNull().unique())
    .addColumn('first_name', 'text', (col) => col.notNull())
    .addColumn('last_name', 'text')
    .addColumn('username', 'text', (col) => col.unique())
    .addColumn('phone_number', 'text', (col) => col.unique())
    .addColumn('avatar_url', 'text')
    .addColumn('two_factor_enabled', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('is_anonymous', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('is_banned', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('ban_reason', 'text')
    .addColumn('banned_until', 'text')
    .addColumn('email_verified_at', 'text')
    .addColumn('phone_verified_at', 'text')
    .addColumn('created_at', 'text', (col) => col.defaultTo(ISO_TIMESTAMP).notNull())
    .addColumn('updated_at', 'text', (col) => col.defaultTo(ISO_TIMESTAMP).notNull())
    .modifyEnd(sql`STRICT`)
    .execute()

  // Indexes for user table
  await db.schema.createIndex('users_email_idx').on('users').column('email').execute()

  await db.schema.createIndex('users_username_idx').on('users').column('username').execute()

  await db.schema.createIndex('users_phone_number_idx').on('users').column('phone_number').execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('users_phone_number_idx').ifExists().execute()
  await db.schema.dropIndex('users_username_idx').ifExists().execute()
  await db.schema.dropIndex('users_email_idx').ifExists().execute()
  await db.schema.dropTable('users').ifExists().execute()
}
