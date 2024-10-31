import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { defineCommand, showUsage } from 'citty'
import consola from 'consola'
import { join } from 'pathe'
import { MIGRATION_FOLDER } from '~/database/migrator'

async function isMigrationNameUnique(name: string): Promise<boolean> {
  const files = await readdir(MIGRATION_FOLDER)
  return !files.some((file) => file.split('_').slice(1).join('_') === `${name}.ts`)
}

async function getNextMigrationNumber(): Promise<number> {
  const files = await readdir(MIGRATION_FOLDER)
  const numbers = files
    .map((file) => Number.parseInt(file.split('_')[0] ?? '', 10))
    .filter((num) => !Number.isNaN(num))

  return Math.max(0, ...numbers) + 1
}

export default defineCommand({
  meta: {
    name: 'migration',
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
      const template = `import { type Kysely, sql } from 'kysely'
import { UNIX_TIMESTAMP } from '~/database/db.helper'
import type { Database } from '~/database/db.schema'

// For more info, see: https://kysely.dev/docs/migrations

// up migration code goes here...
// note: up migrations are mandatory. you must implement this function.
export async function up(db: Kysely<Database>): Promise<void> {
  // Create table
  await db.schema
    .createTable('TABLE_NAME')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('created_at', 'integer', (col) => col.notNull().defaultTo(UNIX_TIMESTAMP))
    .addColumn('updated_at', 'integer')
    .modifyEnd(sql\`STRICT\`)
    .ifNotExists()
    .execute()

  // Create auto-update trigger
  await sql\`
    CREATE TRIGGER IF NOT EXISTS update_TABLE_NAME_timestamp
    AFTER UPDATE ON TABLE_NAME
    FOR EACH ROW
    BEGIN
      UPDATE TABLE_NAME
      SET updated_at = strftime('%s', 'now')
      WHERE id = NEW.id;
    END;
  \`.execute(db)

  // Create indexes
  await db.schema
    .createIndex('TABLE_NAME_created_at_idx')
    .on('TABLE_NAME')
    .column('created_at')
    .ifNotExists()
    .execute()
}

// down migration code goes here...
// note: down migrations are optional. you can safely delete this function.
export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('TABLE_NAME_created_at_idx').ifExists().execute()
  await sql\`DROP TRIGGER IF EXISTS update_TABLE_NAME_timestamp;\`.execute(db)
  await db.schema.dropTable('TABLE_NAME').ifExists().execute()
}`

      // Check migration name uniqueness after folder exists
      if (!(await isMigrationNameUnique(migrationName))) {
        consola.error(`Migration with name "${migrationName}" already exists`)
        return
      }

      const nextNumber = await getNextMigrationNumber()
      const paddedNumber = nextNumber.toString().padStart(5, '0')
      const fileName = `${paddedNumber}_${migrationName}.ts`
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
