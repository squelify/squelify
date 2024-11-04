import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

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
export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('user_bans')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('banned_by', 'text', (col) => col.references('users.id').onDelete('set null'))
    .addColumn('reason', 'text', (col) => col.notNull())
    .addColumn('details', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('expires_at', 'integer')
    .addColumn('appeal_status', 'text', (col) =>
      col.check(sql`appeal_status IN ('none', 'pending', 'approved', 'rejected')`)
    )
    .addColumn('appeal_reason', 'text')
    .addColumn('appeal_reviewed_by', 'text', (col) =>
      col.references('users.id').onDelete('set null')
    )
    .addColumn('appeal_reviewed_at', 'integer')
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  // Indexes
  await db.schema
    .createIndex('user_bans_user_id_idx')
    .on('user_bans')
    .column('user_id')
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('user_bans_expires_idx')
    .on('user_bans')
    .columns(['user_id', 'expires_at'])
    .ifNotExists()
    .execute()

  // Create auto-update trigger
  await sql`
    CREATE TRIGGER IF NOT EXISTS update_user_bans_timestamp
    AFTER UPDATE ON user_bans
    FOR EACH ROW
    BEGIN
      UPDATE user_bans
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('user_bans_user_id_idx').ifExists().execute()
  await db.schema.dropIndex('user_bans_expires_idx').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS update_user_bans_timestamp;`.execute(db)
  await db.schema.dropTable('user_bans').ifExists().execute()
}
