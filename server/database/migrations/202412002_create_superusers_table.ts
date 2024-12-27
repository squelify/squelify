// For more info, see: https://kysely.dev/docs/migrations
// Up migrations are mandatory. you must implement this function.
// Down migrations are optional. you can safely delete this function.

import { type Kysely, sql } from 'kysely'
import { addColumnTimestamps } from '~/database/db.helper'
import { createTriggerUpdatedAt, dropTriggerUpdatedAt } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export const up = async (db: Kysely<Database>): Promise<void> => {
  // Execute SQL statements with specific schema
  const dbSchema = db.schema.withSchema('internal')

  // Create table
  await dbSchema
    .createTable('superusers')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .$call(addColumnTimestamps)
    .modifyEnd(sql`USING heap`)
    .execute()

  // Create auto-update trigger
  await createTriggerUpdatedAt('internal', 'superusers').execute(db)

  // Create indexes for primary key
  await dbSchema.createIndex('idx_superusers_id').on('superusers').column('id').execute()

  // Create indexes for created_at
  await dbSchema
    .createIndex('idx_superusers_created_at')
    .on('superusers')
    .column('created_at')
    .execute()

  // Create indexes for updated_at
  await dbSchema
    .createIndex('idx_superusers_updated_at')
    .on('superusers')
    .column('updated_at')
    .execute()
}

export const down = async (db: Kysely<Database>): Promise<void> => {
  const dbSchema = db.schema.withSchema('internal')
  await dbSchema.dropIndex('idx_superusers_updated_at').ifExists().execute()
  await dbSchema.dropIndex('idx_superusers_created_at').ifExists().execute()
  await dbSchema.dropIndex('idx_superusers_id').ifExists().execute()
  await dropTriggerUpdatedAt('internal', 'superusers').execute(db)
  await dbSchema.dropTable('superusers').ifExists().execute()
}
