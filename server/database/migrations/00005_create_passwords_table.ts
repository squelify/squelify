import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'
import { DEFAULT_PASSWORD_ALGORITHM } from '~/database/schemas/password'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('passwords')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull().references('users.id').onDelete('cascade'))
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

  // Auto-update trigger
  await sql`
    CREATE TRIGGER IF NOT EXISTS update_passwords_timestamp
    AFTER UPDATE ON passwords
    FOR EACH ROW
    BEGIN
      UPDATE passwords
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  // Auto-update last_changed_at trigger
  await sql`
    CREATE TRIGGER IF NOT EXISTS update_passwords_last_changed
    AFTER UPDATE ON passwords
    WHEN NEW.hash != OLD.hash
    BEGIN
      UPDATE passwords
      SET last_changed_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  // Reset failed attempts on successful password change
  await sql`
    CREATE TRIGGER IF NOT EXISTS reset_password_attempts
    AFTER UPDATE ON passwords
    WHEN NEW.hash != OLD.hash
    BEGIN
      UPDATE passwords
      SET failed_attempts = 0,
          locked_until = NULL
      WHERE id = NEW.id;
    END;
  `.execute(db)

  // Indexes
  await db.schema
    .createIndex('passwords_user_id_idx')
    .on('passwords')
    .column('user_id')
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('passwords_reset_required_idx')
    .on('passwords')
    .columns(['user_id', 'reset_required'])
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('passwords_locked_idx')
    .on('passwords')
    .columns(['user_id', 'locked_until'])
    .ifNotExists()
    .execute()

  await db.schema
    .createIndex('passwords_expires_idx')
    .on('passwords')
    .columns(['user_id', 'expires_at'])
    .ifNotExists()
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('passwords_expires_idx').ifExists().execute()
  await db.schema.dropIndex('passwords_locked_idx').ifExists().execute()
  await db.schema.dropIndex('passwords_reset_required_idx').ifExists().execute()
  await db.schema.dropIndex('passwords_user_id_idx').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS reset_password_attempts;`.execute(db)
  await sql`DROP TRIGGER IF EXISTS update_passwords_last_changed;`.execute(db)
  await sql`DROP TRIGGER IF EXISTS update_passwords_timestamp;`.execute(db)
  await db.schema.dropTable('passwords').ifExists().execute()
}
