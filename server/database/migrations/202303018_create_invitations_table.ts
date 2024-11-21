import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('sq_invitations')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('organization_id', 'text', (col) =>
      col.notNull().references('sq_organizations.id').onDelete('cascade')
    )
    .addColumn('email', 'text', (col) => col.notNull())
    .addColumn('role', 'text', (col) =>
      col.notNull().check(sql`role IN ('org:admin', 'org:member')`)
    )
    .addColumn('token', 'text', (col) => col.notNull().unique())
    .addColumn('invited_by', 'text', (col) => col.notNull().references('sq_users.id'))
    .addColumn('status', 'text', (col) =>
      col
        .notNull()
        .defaultTo('pending')
        .check(sql`status IN ('pending', 'accepted', 'expired', 'revoked')`)
    )
    .addColumn('expires_at', 'integer', (col) => col.notNull())
    .addColumn('accepted_at', 'integer')
    .addColumn('metadata', 'text', (col) => col.notNull().defaultTo('{}'))
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql`STRICT`)
    .ifNotExists()
    .execute()

  /**
   * Trigger to automatically update timestamp when invitation record changes
   * Ensures accurate tracking of invitation lifecycle
   */
  await sql`
    CREATE TRIGGER IF NOT EXISTS sq_trg_invitations_timestamp
    AFTER UPDATE ON sq_invitations
    FOR EACH ROW
    BEGIN
      UPDATE sq_invitations
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db)

  /**
   * Compound index for organization-email pairs
   * Optimizes invitation lookups for specific emails within organizations
   */
  await db.schema
    .createIndex('sq_idx_invitations_org_email')
    .on('sq_invitations')
    .columns(['organization_id', 'email'])
    .ifNotExists()
    .execute()

  /**
   * Index for token-based invitation lookups
   * Enhances invitation validation queries
   */
  await db.schema
    .createIndex('sq_idx_invitations_token')
    .on('sq_invitations')
    .column('token')
    .ifNotExists()
    .execute()

  /**
   * Index for status-based filtering
   * Improves performance when filtering invitations by status
   */
  await db.schema
    .createIndex('sq_idx_invitations_status')
    .on('sq_invitations')
    .column('status')
    .ifNotExists()
    .execute()

  /**
   * Index for expiration checks
   * Optimizes queries that handle invitation expiration
   */
  await db.schema
    .createIndex('sq_idx_invitations_expires')
    .on('sq_invitations')
    .column('expires_at')
    .ifNotExists()
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('sq_idx_invitations_expires').ifExists().execute()
  await db.schema.dropIndex('sq_idx_invitations_status').ifExists().execute()
  await db.schema.dropIndex('sq_idx_invitations_token').ifExists().execute()
  await db.schema.dropIndex('sq_idx_invitations_org_email').ifExists().execute()
  await sql`DROP TRIGGER IF EXISTS sq_trg_invitations_timestamp;`.execute(db)
  await db.schema.dropTable('sq_invitations').ifExists().execute()
}
