import { type Kysely, sql } from 'kysely'
import type { Database } from '~/database/db.schema'

export const up = async (db: Kysely<Database>): Promise<void> => {
  // Prepare extra schema and extensions
  await sql`set timezone='UTC'`.execute(db) /* Set to UTC timezone */
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`.execute(db)
  await sql`CREATE SCHEMA IF NOT EXISTS reference;`.execute(db)

  // Create auto-update function
  await sql`CREATE OR REPLACE FUNCTION fn_updated_at_value()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db)
}

export const down = async (db: Kysely<Database>): Promise<void> => {
  await sql`DROP FUNCTION IF EXISTS fn_updated_at_value();`.execute(db)
  await sql`DROP SCHEMA IF EXISTS reference CASCADE;`.execute(db)
  await sql`DROP EXTENSION IF EXISTS "uuid-ossp";`.execute(db)
}
