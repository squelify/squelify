import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

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

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('user_metadata')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull().references('users.id').onDelete('cascade'))
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

  // Create auto-update trigger
  await sql`
    CREATE TRIGGER IF NOT EXISTS update_user_metadata_timestamp
    AFTER UPDATE ON user_metadata
    FOR EACH ROW
    BEGIN
      UPDATE user_metadata
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  // Indexes
  await db.schema
    .createIndex('user_metadata_user_id_idx')
    .on('user_metadata')
    .column('user_id')
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('user_metadata_lookup_idx')
    .on('user_metadata')
    .columns(['user_id', 'key'])
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('user_metadata_public_idx')
    .on('user_metadata')
    .columns(['user_id', 'is_public'])
    .ifNotExists()
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('user_metadata_public_idx').ifExists().execute()
  await db.schema.dropIndex('user_metadata_lookup_idx').ifExists().execute()
  await db.schema.dropIndex('user_metadata_user_id_idx').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS update_user_metadata_timestamp;`.execute(db)
  await db.schema.dropTable('user_metadata').ifExists().execute()
}
