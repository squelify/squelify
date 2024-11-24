import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export const up = async (db: Kysely<Database>): Promise<void> => {
  // Create migrations table with strict mode enabled
  await db.schema
    .createTable('sq_migrations')
    .addColumn('name', 'text', (col) => col.primaryKey().notNull())
    .addColumn('executed_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  /**
   * Index for faster lookups by execution time
   */
  await db.schema
    .createIndex('sq_idx_migrations_executed_at')
    .on('sq_migrations')
    .column('executed_at')
    .ifNotExists()
    .execute()
}

export const down = async (db: Kysely<Database>): Promise<void> => {
  await db.schema.dropIndex('sq_idx_migrations_executed_at').ifExists().execute()
  await db.schema.dropTable('sq_migrations').ifExists().execute()
}
