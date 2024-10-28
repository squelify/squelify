import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('passwords')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('hash', 'text', (col) => col.notNull())
    .addColumn('algorithm', 'text', (col) =>
      col.notNull().defaultTo('argon2id').check(sql`algorithm IN ('argon2id', 'bcrypt', 'scrypt')`)
    )
    .addColumn('last_changed_at', 'integer')
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .execute()

  // Create auto-update trigger
  await sql`
    CREATE TRIGGER update_passwords_timestamp
    AFTER UPDATE ON passwords
    FOR EACH ROW
    BEGIN
      UPDATE passwords
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  // Indexes
  await db.schema.createIndex('passwords_user_id_idx').on('passwords').column('user_id').execute()
  await db.schema
    .createIndex('passwords_reset_token_idx')
    .on('passwords')
    .column('reset_token')
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('passwords_reset_token_idx').ifExists().execute()
  await db.schema.dropIndex('passwords_user_id_idx').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS update_passwords_timestamp;`.execute(db)
  await db.schema.dropTable('passwords').ifExists().execute()
}
