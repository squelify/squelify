import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export const up = async (db: Kysely<Database>): Promise<void> => {
  await db.schema
    .createTable('_sq_jwks')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('key_id', 'text', (col) => col.notNull().unique())
    .addColumn('public_key', 'text', (col) => col.notNull())
    .addColumn('private_key', 'text', (col) => col.notNull())
    .addColumn('algorithm', 'text', (col) =>
      col
        .notNull()
        .defaultTo('ES256')
        .check(
          sql`algorithm IN (
          'RS256', 'RS384', 'RS512', 'PS256', 'PS384',
          'PS512', 'ES256', 'ES384', 'ES512', 'EdDSA'
        )`
        )
    )
    .addColumn('is_active', 'integer', (col) =>
      col.notNull().defaultTo(1).check(sql`is_active IN (0, 1)`)
    )
    .addColumn('expires_at', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  /**
   * Trigger to automatically update timestamp when JWK is modified
   * Ensures accurate tracking of key changes for security audit
   */
  await sql`
    CREATE TRIGGER IF NOT EXISTS _sq_trg_jwks_timestamp
    AFTER UPDATE ON _sq_jwks
    FOR EACH ROW
    BEGIN
      UPDATE _sq_jwks
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  /**
   * Index for key_id lookups
   * Optimizes JWK retrieval during token verification
   */
  await db.schema
    .createIndex('_sq_idx_jwks_key')
    .on('_sq_jwks')
    .column('key_id')
    .ifNotExists()
    .execute()

  /**
   * Index for active key filtering
   * Improves queries that filter active signing keys
   */
  await db.schema
    .createIndex('_sq_idx_jwks_active')
    .on('_sq_jwks')
    .column('is_active')
    .ifNotExists()
    .execute()

  /**
   * Index for key expiration checks
   * Enhances queries that validate key validity
   */
  await db.schema
    .createIndex('_sq_idx_jwks_expires')
    .on('_sq_jwks')
    .column('expires_at')
    .ifNotExists()
    .execute()
}

export const down = async (db: Kysely<Database>): Promise<void> => {
  await db.schema.dropIndex('_sq_idx_jwks_expires').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_jwks_active').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_jwks_key').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS _sq_trg_jwks_timestamp;`.execute(db)
  await db.schema.dropTable('_sq_jwks').ifExists().execute()
}
