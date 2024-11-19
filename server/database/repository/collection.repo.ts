import { Kysely } from 'kysely'

/**
 * Checks if a table exists in the database
 * Excludes system tables and internal tables with sq_ prefix
 */
export async function isTableExists(db: Kysely<any>, tableName: string): Promise<boolean> {
  const table = await db
    .selectFrom('sqlite_master')
    .select(['name'])
    .where('type', '=', 'table')
    .where('name', 'not like', 'sqlite_%')
    .where('name', 'not like', 'sq_%')
    .where('name', '=', tableName)
    .limit(1)
    .execute()

  return table.length > 0
}

/**
 * Gets table schema information including columns and their types
 */
export async function getTableSchema(db: Kysely<any>, tableName: string) {
  return db
    .selectFrom('sqlite_master')
    .select(['sql'])
    .where('type', '=', 'table')
    .where('name', '=', tableName)
    .executeTakeFirst()
}

/**
 * Lists all available tables excluding system and internal tables
 */
export async function listTables(db: Kysely<any>) {
  return db
    .selectFrom('sqlite_master')
    .select(['name', 'sql'])
    .where('type', '=', 'table')
    .where('name', 'not like', 'sqlite_%')
    .where('name', 'not like', 'sq_%')
    .execute()
}

/**
 * Gets table indexes information
 */
export async function getTableIndexes(db: Kysely<any>, tableName: string) {
  return db
    .selectFrom('sqlite_master')
    .select(['name', 'sql'])
    .where('type', '=', 'index')
    .where('tbl_name', '=', tableName)
    .execute()
}
