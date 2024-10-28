import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('jwks')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('key_id', 'text', (col) => col.notNull().unique())
    .addColumn('public_key', 'text', (col) => col.notNull())
    .addColumn('private_key', 'text', (col) => col.notNull())
    .addColumn('algorithm', 'text', (col) =>
      col
        .notNull()
        .defaultTo('RS256')
        .check(
          sql`algorithm IN (
          'RS256', 'RS384', 'RS512',
          'PS256', 'PS384', 'PS512',
          'ES256', 'ES384', 'ES512',
          'EdDSA'
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
    .execute()

  // Indexes
  await db.schema.createIndex('jwks_key_id_idx').on('jwks').column('key_id').execute()
  await db.schema.createIndex('jwks_is_active_idx').on('jwks').column('is_active').execute()
  await db.schema.createIndex('jwks_expires_at_idx').on('jwks').column('expires_at').execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('jwks_expires_at_idx').ifExists().execute()
  await db.schema.dropIndex('jwks_is_active_idx').ifExists().execute()
  await db.schema.dropIndex('jwks_key_id_idx').ifExists().execute()
  await db.schema.dropTable('jwks').ifExists().execute()
}
