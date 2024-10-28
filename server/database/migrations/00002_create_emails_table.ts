import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('emails')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('email', 'text', (col) => col.notNull().unique().check(sql`LENGTH(email) > 3`))
    .addColumn('is_primary', 'integer', (col) =>
      col.notNull().defaultTo(0).check(sql`is_primary IN (0, 1)`)
    )
    .addColumn('is_verified', 'integer', (col) =>
      col.notNull().defaultTo(0).check(sql`is_verified IN (0, 1)`)
    )
    .addColumn('verified_at', 'integer')
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .execute()

  // Indexes
  await db.schema.createIndex('emails_user_id_idx').on('emails').column('user_id').execute()
  await db.schema.createIndex('emails_email_idx').on('emails').column('email').execute()
  await db.schema
    .createIndex('emails_is_primary_idx')
    .on('emails')
    .columns(['user_id', 'is_primary'])
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('emails_is_primary_idx').ifExists().execute()
  await db.schema.dropIndex('emails_email_idx').ifExists().execute()
  await db.schema.dropIndex('emails_user_id_idx').ifExists().execute()
  await db.schema.dropTable('emails').ifExists().execute()
}
