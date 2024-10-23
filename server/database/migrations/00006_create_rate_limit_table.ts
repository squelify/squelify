import type { Kysely } from 'kysely'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('rate_limit')
    .addColumn('key', 'text', (col) => col.primaryKey())
    .addColumn('max', 'integer', (col) => col.notNull())
    .addColumn('window', 'integer', (col) => col.notNull())
    .addColumn('count', 'integer', (col) => col.notNull())
    .addColumn('last_request', 'integer', (col) => col.notNull())
    .execute()

  // Index for rate_limit table
  await db.schema.createIndex('rate_limit_key_idx').on('rate_limit').column('key').execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('rate_limit_key_idx').ifExists().execute()
  await db.schema.dropTable('rate_limit').ifExists().execute()
}
