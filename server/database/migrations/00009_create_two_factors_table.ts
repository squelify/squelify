import { type Kysely, sql } from 'kysely'
import { ISO_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('two_factors')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('type', 'text', (col) => col.notNull().check(sql`type IN ('totp', 'email', 'sms')`))
    .addColumn('secret', 'text', (col) => col.notNull())
    .addColumn('backup_codes', 'text', (col) => col.notNull().defaultTo('[]'))
    .addColumn('last_used_at', 'text')
    .addColumn('is_verified', 'integer', (col) =>
      col.notNull().defaultTo(0).check(sql`is_verified IN (0, 1)`)
    )
    .addColumn('verified_at', 'text')
    .addColumn('created_at', 'text', (col) => col.notNull().defaultTo(ISO_TIMESTAMP))
    .addColumn('updated_at', 'text')
    .modifyEnd(sql`STRICT`)
    .execute()

  // Indexes
  await db.schema
    .createIndex('two_factors_user_id_type_idx')
    .on('two_factors')
    .columns(['user_id', 'type'])
    .unique()
    .execute()

  await db.schema
    .createIndex('two_factors_user_id_idx')
    .on('two_factors')
    .column('user_id')
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('two_factors_user_id_idx').ifExists().execute()
  await db.schema.dropIndex('two_factors_user_id_type_idx').ifExists().execute()
  await db.schema.dropTable('two_factors').ifExists().execute()
}
