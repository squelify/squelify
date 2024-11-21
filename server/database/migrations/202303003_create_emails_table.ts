import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('sq_emails')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) =>
      col.notNull().references('sq_users.id').onDelete('cascade')
    )
    .addColumn('email', 'text', (col) => col.notNull().unique().check(sql`LENGTH(email) > 3`))
    .addColumn('is_primary', 'integer', (col) =>
      col.notNull().defaultTo(0).check(sql`is_primary IN (0, 1)`)
    )
    .addColumn('verified_at', 'integer')
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  /**
   * Trigger to automatically update timestamp when email record changes
   * Ensures accurate tracking of email modifications
   */
  await sql`
    CREATE TRIGGER IF NOT EXISTS sq_trg_emails_timestamp
    AFTER UPDATE ON sq_emails
    FOR EACH ROW
    BEGIN
      UPDATE sq_emails
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  /**
   * Primary lookup index for user's emails
   * Optimizes queries filtering by user_id
   */
  await db.schema
    .createIndex('sq_idx_emails_user')
    .on('sq_emails')
    .column('user_id')
    .ifNotExists()
    .execute()

  /**
   * Index for email address lookups
   * Improves performance for email uniqueness checks and searches
   */
  await db.schema
    .createIndex('sq_idx_emails_address')
    .on('sq_emails')
    .column('email')
    .ifNotExists()
    .execute()

  /**
   * Compound index for primary email filtering
   * Enhances queries that look up user's primary email
   */
  await db.schema
    .createIndex('sq_idx_emails_primary')
    .on('sq_emails')
    .columns(['user_id', 'is_primary'])
    .ifNotExists()
    .execute()

  /**
   * Index for email verification status
   * Optimizes queries filtering verified/unverified emails
   */
  await db.schema
    .createIndex('sq_idx_emails_verified')
    .on('sq_emails')
    .columns(['user_id', 'verified_at'])
    .ifNotExists()
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('sq_idx_emails_verified').ifExists().execute()
  await db.schema.dropIndex('sq_idx_emails_primary').ifExists().execute()
  await db.schema.dropIndex('sq_idx_emails_address').ifExists().execute()
  await db.schema.dropIndex('sq_idx_emails_user').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS sq_trg_emails_timestamp;`.execute(db)
  await db.schema.dropTable('sq_emails').ifExists().execute()
}
