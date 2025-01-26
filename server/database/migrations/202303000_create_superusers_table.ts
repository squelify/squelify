// For more info, see: https://kysely.dev/docs/migrations
// Up migrations are mandatory. you must implement this function.
// Down migrations are optional. you can safely delete this function.

import { type Kysely, sql } from 'kysely'
import { addColumnTimestamps } from '~/database/db.helper'
import { createTriggerUpdatedAt, dropTriggerUpdatedAt } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export const up = async (db: Kysely<Database>): Promise<void> => {
  // Create table
  await db.schema
    .createTable('_sq_superusers')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .$call(addColumnTimestamps)
    .modifyEnd(sql`STRICT`)
    .execute()

  // Create auto-update trigger
  await createTriggerUpdatedAt('_sq_superusers', true).execute(db)

  // Create indexes for primary key
  await db.schema.createIndex('_sq_idx_superusers_id').on('_sq_superusers').column('id').execute()

  // Create indexes for created_at
  await db.schema
    .createIndex('_sq_idx_superusers_created_at')
    .on('_sq_superusers')
    .column('created_at')
    .execute()

  // Create indexes for updated_at
  await db.schema
    .createIndex('_sq_idx_superusers_updated_at')
    .on('_sq_superusers')
    .column('updated_at')
    .execute()
}

export const down = async (db: Kysely<Database>): Promise<void> => {
  await db.schema.dropIndex('_sq_idx_superusers_updated_at').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_superusers_created_at').ifExists().execute()
  await db.schema.dropIndex('_sq_idx_superusers_id').ifExists().execute()
  await dropTriggerUpdatedAt('_sq_superusers', true).execute(db)
  await db.schema.dropTable('_sq_superusers').ifExists().execute()
}
