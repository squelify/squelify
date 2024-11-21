/**
 * User Metadata Table
 *
 * Stores additional user information that may change frequently or is specific to certain features.
 *
 * Common metadata fields:
 * - preferences
 *   - theme: light/dark/system
 *   - timezone: Asia/Jakarta
 *   - language: id-ID
 *   - notifications: enabled/disabled
 *   - email_notifications: enabled/disabled
 *
 * - profile
 *   - bio: string
 *   - company: string
 *   - position: string
 *   - location: string
 *   - website: string
 *   - social_links: {twitter, github, linkedin}
 *
 * - security
 *   - last_password_change: timestamp
 *   - failed_login_attempts: number
 *   - security_questions: [{q1, a1}, {q2, a2}]
 *   - trusted_devices: [{id, name, last_used}]
 *
 * - features
 *   - beta_tester: boolean
 *   - feature_flags: {flag1: true, flag2: false}
 *   - permissions_cache: [permission1, permission2]
 *
 * - analytics
 *   - last_active: timestamp
 *   - login_count: number
 *   - devices: [{type, os, browser}]
 *   - locations: [{ip, country, city}]
 */

import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export const up = async (db: Kysely<Database>): Promise<void> => {
  await db.schema
    .createTable('sq_user_metadata')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) =>
      col.notNull().references('sq_users.id').onDelete('cascade')
    )
    .addColumn('key', 'text', (col) => col.notNull())
    .addColumn('value', 'text', (col) => col.notNull())
    .addColumn('is_public', 'integer', (col) =>
      col.notNull().defaultTo(0).check(sql`is_public IN (0, 1)`)
    )
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  /**
   * Trigger to automatically update timestamp when metadata is modified
   * Ensures accurate tracking of metadata changes
   */
  await sql`
    CREATE TRIGGER IF NOT EXISTS sq_trg_user_metadata_timestamp
    AFTER UPDATE ON sq_user_metadata
    FOR EACH ROW
    BEGIN
      UPDATE sq_user_metadata
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  /**
   * Primary lookup index for user metadata
   * Optimizes queries filtering by user_id
   */
  await db.schema
    .createIndex('sq_idx_user_metadata_user')
    .on('sq_user_metadata')
    .column('user_id')
    .ifNotExists()
    .execute()

  /**
   * Compound index for key-based lookups
   * Improves performance when querying specific metadata keys for a user
   */
  await db.schema
    .createIndex('sq_idx_user_metadata_lookup')
    .on('sq_user_metadata')
    .columns(['user_id', 'key'])
    .ifNotExists()
    .execute()

  /**
   * Index for public metadata filtering
   * Enhances queries that filter public/private metadata
   */
  await db.schema
    .createIndex('sq_idx_user_metadata_public')
    .on('sq_user_metadata')
    .columns(['user_id', 'is_public'])
    .ifNotExists()
    .execute()
}

export const down = async (db: Kysely<Database>): Promise<void> => {
  await db.schema.dropIndex('sq_idx_user_metadata_public').ifExists().execute()
  await db.schema.dropIndex('sq_idx_user_metadata_lookup').ifExists().execute()
  await db.schema.dropIndex('sq_idx_user_metadata_user').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS sq_trg_user_metadata_timestamp;`.execute(db)
  await db.schema.dropTable('sq_user_metadata').ifExists().execute()
}
