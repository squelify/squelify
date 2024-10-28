import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('first_name', 'text', (col) => col.notNull())
    .addColumn('last_name', 'text')
    .addColumn('username', 'text', (col) => col.unique().check(sql`LENGTH(username) >= 3`))
    .addColumn('avatar_url', 'text')
    .addColumn('locale', 'text', (col) => col.defaultTo('en'))
    .addColumn('is_active', 'integer', (col) =>
      col.notNull().defaultTo(1).check(sql`is_active IN (0, 1)`)
    )
    .addColumn('is_banned', 'integer', (col) =>
      col.notNull().defaultTo(0).check(sql`is_banned IN (0, 1)`)
    )
    .addColumn('ban_reason', 'text')
    .addColumn('banned_until', 'integer')
    .addColumn('last_sign_in_at', 'integer')
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .execute()

  // Indexes
  await db.schema.createIndex('users_username_idx').on('users').column('username').execute()
  await db.schema.createIndex('users_is_active_idx').on('users').column('is_active').execute()
  await db.schema.createIndex('users_created_at_idx').on('users').column('created_at').execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('users_created_at_idx').ifExists().execute()
  await db.schema.dropIndex('users_is_active_idx').ifExists().execute()
  await db.schema.dropIndex('users_username_idx').ifExists().execute()
  await db.schema.dropTable('users').ifExists().execute()
}
