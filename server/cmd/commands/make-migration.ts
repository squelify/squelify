/**
 * Migration File Generator
 *
 * Generates database migration files with standardized naming format:
 * YYYYMMXXX_NAME.ts where:
 * - YYYYMM: Year and month (e.g. 202412)
 * - XXX: Sequential number within month (e.g. 001)
 * - NAME: Migration name in snake_case
 *
 * Naming Convention:
 * - create_* : Create new table
 * - alter_* : Modify table structure
 * - add_* : Add column or constraint
 * - drop_* : Drop table or column
 * - update_* : Update existing data
 * - index_* : Create database index
 * - seed_* : Seed database with initial data
 *
 * Usage:
 * ```
 * pnpm run make:migration create_users_table
 * // Generates: 202412001_create_users_table.ts
 * ```
 *
 * @module server/cmd/make/migration
 */

import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { defineCommand, showUsage } from 'citty'
import consola from 'consola'
import { join } from 'pathe'

const MIGRATION_FOLDER = join(process.cwd(), 'server/database/migrations')

/**
 * Checks if migration name is unique in migrations folder
 * @param name Migration name to check
 * @returns True if name is unique, false otherwise
 */
async function isMigrationNameUnique(name: string): Promise<boolean> {
  const files = await readdir(MIGRATION_FOLDER)
  return !files.some((file) => {
    const parts = file.split('_')
    const migrationName = parts[1]
    return migrationName === `${name}.ts`
  })
}

/**
 * Generates next migration number in YYYYMMXXX format
 * - YYYYMM: Current year and month
 * - XXX: Sequential number, resets each month
 * @returns Migration number string (e.g. 202412001)
 */
async function getNextMigrationNumber(): Promise<string> {
  const files = await readdir(MIGRATION_FOLDER)
  const currentDate = new Date()
  const yearMonth = `${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, '0')}`

  // Filter files for current year and month
  const currentMonthFiles = files.filter((file) => file.startsWith(yearMonth))

  // Extract sequence numbers for current month
  const numbers = currentMonthFiles
    .map((file) => {
      const seqNum = file.substring(6, 9) // Extract XXX part
      return Number.parseInt(seqNum, 10)
    })
    .filter((num) => !Number.isNaN(num))

  const nextNumber = (Math.max(0, ...numbers) + 1).toString().padStart(3, '0')
  return `${yearMonth}${nextNumber}`
}

export default defineCommand({
  meta: {
    name: 'make:migration',
    description: 'Create a new migration file',
  },
  args: {
    name: {
      type: 'positional',
      description: 'Migration name (e.g. create_users_table)',
      required: true,
    },
    help: {
      type: 'boolean',
      description: 'Print information about the command',
      default: false,
    },
  },
  async setup() {
    try {
      // Create migration folder first
      await mkdir(MIGRATION_FOLDER, { recursive: true })
    } catch (error) {
      consola.error(error instanceof Error ? error.message : 'Unknown error occurred')
      process.exit(1)
    }
  },
  async run({ args, cmd }) {
    // Show help page if --help flag is used or no subcommand provided
    if (args.help || args._.length === 0) {
      showUsage(cmd)
      return
    }

    try {
      const migrationName = args.name.replace(/[^a-zA-Z0-9_]/g, '_')
      const template = `// For more info, see: https://kysely.dev/docs/migrations
// Up migrations are mandatory. you must implement this function.
// Down migrations are optional. you can safely delete this function.

import { type Kysely, sql } from 'kysely'
import { addColumnTimestamps } from '~/database/db.helper'
import { createTriggerUpdatedAt, dropTriggerUpdatedAt } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

export const up = async (db: Kysely<Database>): Promise<void> => {
  // Create table
  await db.schema
    .createTable('TABLE_NAME')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .$call(addColumnTimestamps)
    .modifyEnd(sql\`STRICT\`)
    .execute()

  // Create auto-update trigger
  await createTriggerUpdatedAt('TABLE_NAME').execute(db)

  // Create indexes for primary key
  await db.schema.createIndex('idx_TABLE_NAME_id').on('TABLE_NAME').column('id').execute()

  // Create indexes for created_at
  await db.schema
    .createIndex('idx_TABLE_NAME_created_at')
    .on('TABLE_NAME')
    .column('created_at')
    .execute()

  // Create indexes for updated_at
  await db.schema
    .createIndex('idx_TABLE_NAME_updated_at')
    .on('TABLE_NAME')
    .column('updated_at')
    .execute()
}

export const down = async (db: Kysely<Database>): Promise<void> => {
  await db.schema.dropIndex('idx_TABLE_NAME_updated_at').ifExists().execute()
  await db.schema.dropIndex('idx_TABLE_NAME_created_at').ifExists().execute()
  await db.schema.dropIndex('idx_TABLE_NAME_id').ifExists().execute()
  await dropTriggerUpdatedAt('TABLE_NAME').execute(db)
  await db.schema.dropTable('TABLE_NAME').ifExists().execute()
}`

      // Check migration name uniqueness after folder exists
      if (!(await isMigrationNameUnique(migrationName))) {
        consola.error(`Migration with name "${migrationName}" already exists`)
        return
      }

      const prefix = await getNextMigrationNumber()
      const fileName = `${prefix}_${migrationName}.ts`
      const migrationPath = join(MIGRATION_FOLDER, fileName)

      await writeFile(migrationPath, template.trim(), { encoding: 'utf-8' })

      consola.success(`Migration file created successfully: ${fileName}`)
    } catch (error) {
      consola.error(
        `Failed to create migration: ${error instanceof Error ? error.message : String(error)}`
      )
      process.exit(1)
    }
  },
})
