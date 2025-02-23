import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export const up = async (db: Kysely<Database>): Promise<void> => {
  await db.schema
    .createTable('_sq_two_factors')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) =>
      col.notNull().references('_sq_users.id').onDelete('cascade'),
    )
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('type', 'text', (col) => col.notNull().check(sql`type IN ('totp', 'email', 'sms')`))
    .addColumn('secret', 'text', (col) => col.notNull())
    .addColumn('backup_codes', 'text', (col) => col.notNull().defaultTo('[]'))
    .addColumn('is_primary', 'integer', (col) =>
      col.notNull().defaultTo(0).check(sql`is_primary IN (0, 1)`),
    )
    .addColumn('last_used_at', 'integer')
    .addColumn('verified_at', 'integer')
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  /**
   * Trigger to automatically update timestamp when 2FA record changes
   * Ensures accurate tracking of 2FA modifications and usage
   */
  await sql`
    CREATE TRIGGER IF NOT EXISTS _sq_trg_two_factors_timestamp
    AFTER UPDATE ON _sq_two_factors
    FOR EACH ROW
    BEGIN
      UPDATE _sq_two_factors
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  /**
   * Trigger to ensure only one primary 2FA method per user
   * Maintains data integrity for primary 2FA selection
   */
  await sql`
    CREATE TRIGGER IF NOT EXISTS _sq_trg_two_factors_single_primary
    BEFORE INSERT ON _sq_two_factors
    WHEN NEW.is_primary = 1
    BEGIN
      UPDATE _sq_two_factors
      SET is_primary = 0
      WHERE user_id = NEW.user_id AND is_primary = 1;
    END;
  `.execute(db)

  /**
   * Primary lookup index for user's 2FA methods
   * Optimizes queries filtering by user_id
   */
  await db.schema
    .createIndex('_sq_idx_two_factors_user')
    .on('_sq_two_factors')
    .column('user_id')
    .ifNotExists()
    .execute()

  /**
   * Unique compound index for 2FA method identification
   * Ensures unique combination of user, type and name
   */
  await db.schema
    .createIndex('_sq_idx_two_factors_method')
    .on('_sq_two_factors')
    .columns(['user_id', 'type', 'name'])
    .unique()
    .ifNotExists()
    .execute()

  /**
   * Index for verification status checks
   * Enhances queries filtering verified 2FA methods
   */
  await db.schema
    .createIndex('_sq_idx_two_factors_verified')
    .on('_sq_two_factors')
    .columns(['user_id', 'verified_at'])
    .ifNotExists()
    .execute()

  /**
   * Index for primary 2FA method lookups
   * Improves performance when querying primary 2FA methods
   */
  await db.schema
    .createIndex('_sq_idx_two_factors_primary')
    .on('_sq_two_factors')
    .columns(['user_id', 'is_primary'])
    .ifNotExists()
    .execute()

  /**
   * Index for verification timestamp lookups
   * Optimizes queries based on verification time
   */
  await db.schema
    .createIndex('_sq_idx_two_factors_verified_at')
    .on('_sq_two_factors')
    .column('verified_at')
    .ifNotExists()
    .execute()
}

export const down = async (db: Kysely<Database>): Promise<void> => {
  await db.schema.dropIndex('_sq_idx_two_factors_verified_at').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_two_factors_primary').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_two_factors_verified').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_two_factors_method').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_two_factors_user').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS _sq_trg_two_factors_single_primary;`.execute(db)
  await sql`DROP TRIGGER IF EXISTS _sq_trg_two_factors_timestamp;`.execute(db)
  await db.schema.dropTable('_sq_two_factors').ifExists().execute()
}
