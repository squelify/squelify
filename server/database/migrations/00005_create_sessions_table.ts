import { type Kysely, sql } from 'kysely'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('sessions')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('user_id', 'text', (col) => col.notNull().references('users.id'))
    .addColumn('ip_address', 'text')
    .addColumn('user_agent', 'text')
    .addColumn('impersonated_by', 'text', (col) => col.references('users.id'))
    .addColumn('active_organization_id', 'text')
    .addColumn('expires_at', 'text', (col) => col.notNull())
    .modifyEnd(sql`STRICT`)
    .execute()

  // Indexes for session table
  await db.schema.createIndex('sessions_user_id_idx').on('sessions').column('user_id').execute()

  await db.schema
    .createIndex('sessions_expires_at_idx')
    .on('sessions')
    .column('expires_at')
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('sessions_expires_at_idx').ifExists().execute()
  await db.schema.dropIndex('sessions_user_id_idx').ifExists().execute()
  await db.schema.dropTable('sessions').ifExists().execute()
}
