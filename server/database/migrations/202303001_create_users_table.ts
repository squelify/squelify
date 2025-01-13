import { type Kysely, sql } from 'kysely'
import { createTriggerUpdatedAt, dropTriggerUpdatedAt } from '~/database/db.helper'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export const up = async (db: Kysely<Database>): Promise<void> => {
  // Create users table with strict mode enabled
  await db.schema
    .createTable('sq_users')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('first_name', 'text', (col) => col.notNull())
    .addColumn('last_name', 'text')
    .addColumn('username', 'text', (col) => col.unique().check(sql`LENGTH(username) >= 3`))
    .addColumn('avatar_url', 'text')
    .addColumn('is_active', 'integer', (col) =>
      col.notNull().defaultTo(1).check(sql`is_active IN (0, 1)`)
    )
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .addColumn('deleted_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  // Create auto-update trigger
  await createTriggerUpdatedAt('sq_users', true).execute(db)

  /**
   * Single column indexes for frequent lookup operations
   * Improves query performance for common search patterns
   */
  await db.schema
    .createIndex('sq_idx_users_username')
    .on('sq_users')
    .column('username')
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('sq_idx_users_is_active')
    .on('sq_users')
    .column('is_active')
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('sq_idx_users_created_at')
    .on('sq_users')
    .column('created_at')
    .ifNotExists()
    .execute()

  /**
   * Compound index for name-based searches
   * Optimizes queries that filter or sort by full name
   */
  await db.schema
    .createIndex('sq_idx_users_name_search')
    .on('sq_users')
    .columns(['first_name', 'last_name'])
    .ifNotExists()
    .execute()

  /**
   * Status index for filtering active and soft-deleted records
   * Improves performance for status-based queries
   */
  await db.schema
    .createIndex('sq_idx_users_status')
    .on('sq_users')
    .columns(['is_active', 'deleted_at'])
    .ifNotExists()
    .execute()

  /**
   * Authentication index for login and session validation
   * Speeds up user authentication lookups
   */
  await db.schema
    .createIndex('sq_idx_users_auth')
    .on('sq_users')
    .columns(['username', 'is_active'])
    .ifNotExists()
    .execute()
}

export const down = async (db: Kysely<Database>): Promise<void> => {
  await db.schema.dropIndex('sq_idx_users_auth').ifExists().execute()
  await db.schema.dropIndex('sq_idx_users_status').ifExists().execute()
  await db.schema.dropIndex('sq_idx_users_name_search').ifExists().execute()
  await db.schema.dropIndex('sq_idx_users_created_at').ifExists().execute()
  await db.schema.dropIndex('sq_idx_users_is_active').ifExists().execute()
  await db.schema.dropIndex('sq_idx_users_username').ifExists().execute()
  await dropTriggerUpdatedAt('sq_users', true).execute(db)
  await db.schema.dropTable('sq_users').ifExists().execute()
}
