import { readdir, writeFile } from 'node:fs/promises'
import { join } from 'pathe'
import { MIGRATION_FOLDER, SEEDER_FOLDER } from './migrator'

const isRunningFromCLI = (): boolean => process.argv.length > 2

async function getNextMigrationNumber(): Promise<number> {
  const files = await readdir(MIGRATION_FOLDER)
  const numbers = files
    .map((file) => Number.parseInt(file.split('_')[0] ?? '', 10))
    .filter((num) => !Number.isNaN(num))

  return Math.max(0, ...numbers) + 1
}

async function getNextSeederNumber(): Promise<number> {
  const files = await readdir(SEEDER_FOLDER)
  const numbers = files
    .map((file) => Number.parseInt(file.split('_')[0] ?? '', 10))
    .filter((num) => !Number.isNaN(num))

  return Math.max(0, ...numbers) + 1
}

async function isMigrationNameUnique(name: string): Promise<boolean> {
  const files = await readdir(MIGRATION_FOLDER)
  return !files.some((file) => file.split('_').slice(1).join('_') === `${name}.ts`)
}

async function isSeederNameUnique(name: string): Promise<boolean> {
  const files = await readdir(SEEDER_FOLDER)
  return !files.some((file) => file.split('_').slice(1).join('_') === `${name}.ts`)
}

export async function createMigration(migrationName: string): Promise<void> {
  if (!isRunningFromCLI()) {
    console.error('🔥 This command must be executed via CLI')
    process.exit(0)
  }
  if (!migrationName) {
    console.error('Migration name is required\nExample: pnpm db:make-migration create_user_table')
    process.exit(0)
  }

  const template = `import type { Kysely } from 'kysely'
import type { Database } from '~/database/db.schema'

export async function up(db: Kysely<Database>): Promise<void> {
  // up migration code goes here...
  // note: up migrations are mandatory. you must implement this function.
  // For more info, see: https://kysely.dev/docs/migrations
}

export async function down(db: Kysely<Database>): Promise<void> {
  // down migration code goes here...
  // note: down migrations are optional. you can safely delete this function.
  // For more info, see: https://kysely.dev/docs/migrations
}
`

  const migrationNameFormatted = migrationName.replace(/[^a-zA-Z0-9_]/g, '_')

  if (!(await isMigrationNameUnique(migrationNameFormatted))) {
    console.error(`❌ Migration with name "${migrationNameFormatted}" already exists`)
    process.exit(0)
  }

  const nextNumber = await getNextMigrationNumber()
  const paddedNumber = nextNumber.toString().padStart(5, '0')
  const fileName = `${paddedNumber}_${migrationNameFormatted}.ts`
  const migrationPath = join(MIGRATION_FOLDER, fileName)

  try {
    await writeFile(migrationPath, template.trim())
    console.info(`✅ Migration file created successfully: ${fileName}`)
  } catch (error) {
    console.error(`❌ Failed to create migration file: ${error}`)
    process.exit(1)
  }
}

export async function createSeeder(seederName: string): Promise<void> {
  if (!isRunningFromCLI()) {
    console.error('🔥 This command must be executed via CLI')
    process.exit(0)
  }
  if (!seederName) {
    console.error('Seeder name is required\nExample: pnpm db:make-seeder user_seed')
    process.exit(0)
  }

  const template = `import type { Kysely } from 'kysely'
import type { Database } from '~/database/db.schema'

export async function seed(db: Kysely<Database>): Promise<void> {
	// seed code goes here...
	// note: this function is mandatory. you must implement this function.
}
`

  const seederNameFormatted = seederName.replace(/[^a-zA-Z0-9_]/g, '_')

  if (!(await isSeederNameUnique(seederNameFormatted))) {
    console.error(`❌ Seeder with name "${seederNameFormatted}" already exists`)
    process.exit(0)
  }

  const nextNumber = await getNextSeederNumber()
  const paddedNumber = nextNumber.toString().padStart(5, '0')
  const fileName = `${paddedNumber}_${seederNameFormatted}.ts`
  const seederPath = join(SEEDER_FOLDER, fileName)

  try {
    await writeFile(seederPath, template.trim())
    console.info(`✅ Seeder file created successfully: ${fileName}`)
  } catch (error) {
    console.error(`❌ Failed to create seeder file: ${error}`)
    process.exit(1)
  }
}
