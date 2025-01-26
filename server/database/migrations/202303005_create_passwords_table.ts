import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'
import { DEFAULT_PASSWORD_ALGORITHM } from '~/database/schemas/password'

export const up = async (db: Kysely<Database>): Promise<void> => {
  await db.schema
    .createTable('_sq_passwords')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) =>
      col.notNull().references('_sq_users.id').onDelete('cascade')
    )
    .addColumn('hash', 'text', (col) => col.notNull())
    .addColumn('algorithm', 'text', (col) =>
      col
        .notNull()
        .defaultTo(DEFAULT_PASSWORD_ALGORITHM)
        .check(sql`algorithm IN ('argon2id', 'bcrypt', 'scrypt')`)
    )
    .addColumn('previous_hashes', 'text', (col) => col.notNull().defaultTo('[]'))
    .addColumn('reset_required', 'integer', (col) =>
      col.notNull().defaultTo(0).check(sql`reset_required IN (0, 1)`)
    )
    .addColumn('failed_attempts', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('last_attempt_at', 'integer')
    .addColumn('last_changed_at', 'integer')
    .addColumn('expires_at', 'integer')
    .addColumn('locked_until', 'integer')
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  /**
   * Trigger to automatically update timestamp when password record changes
   * Ensures accurate tracking of password modifications
   */
  await sql`
    CREATE TRIGGER IF NOT EXISTS _sq_trg_passwords_timestamp
    AFTER UPDATE ON _sq_passwords
    FOR EACH ROW
    BEGIN
      UPDATE _sq_passwords
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  /**
   * Trigger to update last_changed_at when password hash changes
   * Tracks password change history for security purposes
   */
  await sql`
    CREATE TRIGGER IF NOT EXISTS _sq_trg_passwords_last_changed
    AFTER UPDATE ON _sq_passwords
    WHEN NEW.hash != OLD.hash
    BEGIN
      UPDATE _sq_passwords
      SET last_changed_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  /**
   * Trigger to reset failed attempts on successful password change
   * Implements security policy for password attempts tracking
   */
  await sql`
    CREATE TRIGGER IF NOT EXISTS _sq_trg_passwords_reset_attempts
    AFTER UPDATE ON _sq_passwords
    WHEN NEW.hash != OLD.hash
    BEGIN
      UPDATE _sq_passwords
      SET failed_attempts = 0,
          locked_until = NULL
      WHERE id = NEW.id;
    END;
  `.execute(db)

  /**
   * Primary lookup index for user passwords
   * Optimizes authentication queries
   */
  await db.schema
    .createIndex('_sq_idx_passwords_user')
    .on('_sq_passwords')
    .column('user_id')
    .ifNotExists()
    .execute()

  /**
   * Index for password reset requirements
   * Enhances queries that check for required password resets
   */
  await db.schema
    .createIndex('_sq_idx_passwords_reset')
    .on('_sq_passwords')
    .columns(['user_id', 'reset_required'])
    .ifNotExists()
    .execute()

  /**
   * Index for account lockout status
   * Improves performance of login attempt checks
   */
  await db.schema
    .createIndex('_sq_idx_passwords_locked')
    .on('_sq_passwords')
    .columns(['user_id', 'locked_until'])
    .ifNotExists()
    .execute()

  /**
   * Index for password expiration checks
   * Optimizes queries that validate password age
   */
  await db.schema
    .createIndex('_sq_idx_passwords_expires')
    .on('_sq_passwords')
    .columns(['user_id', 'expires_at'])
    .ifNotExists()
    .execute()
}

export const down = async (db: Kysely<Database>): Promise<void> => {
  await db.schema.dropIndex('_sq_idx_passwords_expires').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_passwords_locked').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_passwords_reset').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_passwords_user').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS _sq_trg_passwords_reset_attempts;`.execute(db)
  await sql`DROP TRIGGER IF EXISTS _sq_trg_passwords_last_changed;`.execute(db)
  await sql`DROP TRIGGER IF EXISTS _sq_trg_passwords_timestamp;`.execute(db)
  await db.schema.dropTable('_sq_passwords').ifExists().execute()
}
