import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('sq_verifications')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.references('sq_users.id').onDelete('cascade'))
    .addColumn('type', 'text', (col) =>
      col.notNull().check(sql`type IN ('email', 'phone', 'password_reset', 'magic_link', 'otp')`)
    )
    .addColumn('identifier', 'text', (col) => col.notNull())
    .addColumn('token', 'text', (col) => col.notNull())
    .addColumn('attempts', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('max_attempts', 'integer', (col) => col.notNull().defaultTo(3))
    .addColumn('metadata', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('expires_at', 'integer', (col) => col.notNull())
    .addColumn('verified_at', 'integer')
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  /**
   * Trigger to automatically update timestamp when verification record changes
   * Ensures accurate tracking of verification attempts and status changes
   */
  await sql`
    CREATE TRIGGER IF NOT EXISTS sq_trg_verifications_timestamp
    AFTER UPDATE ON sq_verifications
    FOR EACH ROW
    BEGIN
      UPDATE sq_verifications
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  /**
   * Primary lookup index for user verifications
   * Optimizes queries filtering by user_id
   */
  await db.schema
    .createIndex('sq_idx_verifications_user')
    .on('sq_verifications')
    .column('user_id')
    .ifNotExists()
    .execute()

  /**
   * Unique index for verification tokens
   * Ensures token uniqueness and improves token validation queries
   */
  await db.schema
    .createIndex('sq_idx_verifications_token')
    .on('sq_verifications')
    .column('token')
    .unique()
    .ifNotExists()
    .execute()

  /**
   * Compound index for identifier and type lookups
   * Enhances verification request validation
   */
  await db.schema
    .createIndex('sq_idx_verifications_identifier')
    .on('sq_verifications')
    .columns(['identifier', 'type'])
    .ifNotExists()
    .execute()

  /**
   * Index for expiration checks
   * Optimizes cleanup of expired verification requests
   */
  await db.schema
    .createIndex('sq_idx_verifications_expires')
    .on('sq_verifications')
    .column('expires_at')
    .ifNotExists()
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('sq_idx_verifications_expires').ifExists().execute()
  await db.schema.dropIndex('sq_idx_verifications_identifier').ifExists().execute()
  await db.schema.dropIndex('sq_idx_verifications_token').ifExists().execute()
  await db.schema.dropIndex('sq_idx_verifications_user').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS sq_trg_verifications_timestamp;`.execute(db)
  await db.schema.dropTable('sq_verifications').ifExists().execute()
}
