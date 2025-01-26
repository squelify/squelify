/**
 * User Bans Table
 *
 * Stores user ban history and details:
 * - Multiple ban records per user
 * - Ban reasons and duration
 * - Ban authority tracking
 * - Appeal status
 * - Historical ban data
 */

import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export const up = async (db: Kysely<Database>): Promise<void> => {
  await db.schema
    .createTable('_sq_user_bans')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) =>
      col.notNull().references('_sq_users.id').onDelete('cascade')
    )
    .addColumn('banned_by', 'text', (col) => col.references('_sq_users.id').onDelete('set null'))
    .addColumn('reason', 'text', (col) => col.notNull())
    .addColumn('details', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('expires_at', 'integer')
    .addColumn('appeal_status', 'text', (col) =>
      col.check(sql`appeal_status IN ('none', 'pending', 'approved', 'rejected')`)
    )
    .addColumn('appeal_reason', 'text')
    .addColumn('appeal_reviewed_by', 'text', (col) =>
      col.references('_sq_users.id').onDelete('set null')
    )
    .addColumn('appeal_reviewed_at', 'integer')
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  /**
   * Trigger to automatically update timestamp when ban record changes
   * Ensures accurate tracking of ban modifications and appeals
   */
  await sql`
    CREATE TRIGGER IF NOT EXISTS _sq_trg_user_bans_timestamp
    AFTER UPDATE ON _sq_user_bans
    FOR EACH ROW
    BEGIN
      UPDATE _sq_user_bans
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  /**
   * Index for user-based ban lookups
   * Optimizes queries that check user ban status
   */
  await db.schema
    .createIndex('_sq_idx_user_bans_user')
    .on('_sq_user_bans')
    .column('user_id')
    .ifNotExists()
    .execute()

  /**
   * Compound index for expiration checks
   * Enhances queries that manage ban durations
   */
  await db.schema
    .createIndex('_sq_idx_user_bans_expires')
    .on('_sq_user_bans')
    .columns(['user_id', 'expires_at'])
    .ifNotExists()
    .execute()
}

export const down = async (db: Kysely<Database>): Promise<void> => {
  await db.schema.dropIndex('_sq_idx_user_bans_user').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_user_bans_expires').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS _sq_trg_user_bans_timestamp;`.execute(db)
  await db.schema.dropTable('_sq_user_bans').ifExists().execute()
}
