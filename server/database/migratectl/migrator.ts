import 'dotenv/config'
import path from 'node:path'
import { Kysely, Migrator, NO_MIGRATIONS } from 'kysely'
import { env } from 'std-env'
import { kyselyConfig } from '~/database/db.client'
import type { Database } from '~/database/db.schema'
import { AutomaticMigrateProvider, ESMFileMigrationProvider } from '~/database/migratectl/provider'

const isRunningFromCLI = (): boolean => process.argv.length > 2

export const MIGRATION_FOLDER = path.join(import.meta.dirname, '../migrations')
export const SEEDER_FOLDER = path.join(import.meta.dirname, '../seeders')

type MigrationAction = 'migrate' | 'rollback' | 'reset'

const isMakeCommands = (): boolean => {
  const command = process.argv[2]
  const makeCommands = ['make-migration', 'make-seeder']
  return !!command && makeCommands.includes(command)
}

const migrateDBClient = new Kysely<Database>({
  ...kyselyConfig,
  log: env.APP_LOG_LEVEL === 'trace' ? ['error', 'query'] : ['error'],
})

export const migrateClient = new Migrator({
  db: migrateDBClient,
  provider:
    isRunningFromCLI() || isMakeCommands()
      ? new ESMFileMigrationProvider(MIGRATION_FOLDER)
      : new AutomaticMigrateProvider(),
  migrationTableName: '_migration',
  migrationLockTableName: '_migration_lock',
})

interface DatabaseSeeder {
  readonly name: string
  readonly seeder: { default: (db: Kysely<Database>) => Promise<void> }
}

export async function runSeeds(): Promise<void> {
  try {
    const seeders: DatabaseSeeder[] = [
      { name: 'users', seeder: await import('../seeders/00001_user_seed') },
      // { name: 'sites', seeder: await import('./seeders/site.seed') },
    ]

    if (seeders.length > 0) {
      for (const { name, seeder } of seeders) {
        console.info(`🍀 Seeding table ${name}...`)
        await seeder.default(migrateDBClient)
      }
      console.info('🍀 Database seeding completed\n')
    } else {
      console.info('🍀 No seeders provided. Skipping database seeding.')
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('🔥 Database seeding failed:', errMsg)
    throw error
  }
}

const migrationActions: Record<MigrationAction, () => Promise<void>> = {
  migrate: async () => {
    const { error, results } = await migrateClient.migrateToLatest()

    if (results) {
      for (const it of results) {
        if (it.status === 'Success') {
          const message = `🍀 Migration "${it.migrationName}" was executed successfully`
          if (isRunningFromCLI()) {
            console.info(message)
          } else {
            logger.info('[app]', message)
          }
        } else if (it.status === 'Error') {
          const message = `🔥 Failed to execute migration "${it.migrationName}"`
          if (isRunningFromCLI()) {
            console.error(message)
          } else {
            logger.info('[app]', message)
          }
        }
      }
      if (isRunningFromCLI()) {
        console.debug('')
      }
    }

    if (error) {
      console.error('🔥 Failed to migrate:', error)
      if (isRunningFromCLI()) {
        process.exit(1)
      }
    }
  },
  rollback: async () => {
    const { error, results } = await migrateClient.migrateDown()

    if (results) {
      for (const it of results) {
        if (it.status === 'Success') {
          console.info(`🍀 migration "${it.migrationName}" was executed successfully`)
        } else if (it.status === 'Error') {
          console.error(`🔥 Failed to execute migration "${it.migrationName}"`)
        }
      }
      if (isRunningFromCLI()) {
        console.debug('')
      }
    }

    if (error) {
      console.error('🔥 Failed to migrate:', error)
      if (isRunningFromCLI()) {
        process.exit(1)
      }
    }
  },
  reset: async () => {
    await migrateClient
      .migrateTo(NO_MIGRATIONS)
      .then(async () => {
        console.info('🍀 Database has been reset')
        if (isRunningFromCLI()) {
          console.debug('')
        }

        // If has parameter --migrate then run the migration.
        if (process.argv.includes('--migrate')) {
          console.info('🍀 Running database migration...')
          await runMigration('migrate')
        }

        // If has parameter --seed then run the migration.
        if (process.argv.includes('--seed')) {
          console.info('🍀 Populating database with seeders...')
          await runSeeds()
        }

        process.exit(0)
      })
      .catch((e) => {
        console.error('🔥 Failed to reset database:', e.message)
        if (isRunningFromCLI()) {
          process.exit(1)
        }
      })
      .finally(async () => await migrateDBClient.destroy())
  },
}

export async function runMigration(action: MigrationAction): Promise<void> {
  try {
    await migrationActions[action]()
  } catch (error) {
    console.error(`Migration action '${action}' failed:`, error)
    throw error
  }
}

// Flag to indicate whether the migration has been carried out.
let migrationExecuted = false

export async function autoMigrate(): Promise<void> {
  if (migrationExecuted) return

  // Automatically run migrations on startup, but only once.
  // Make sure this called when not executed in command line.
  const migrateCommands = [
    'migrate',
    'rollback',
    'reset',
    'seed',
    'make-migration',
    'make-seeder',
    'generate',
  ]

  const isMigrateCliCommand = !!process.argv[2] && migrateCommands.includes(process.argv[2])
  const shouldAutoMigrate = !isMigrateCliCommand && env.DATABASE_AUTO_MIGRATE

  if (!shouldAutoMigrate) return

  try {
    logger.info('[app]', 'Running database migrations...')
    await runMigration('migrate')
    migrationExecuted = true
  } catch (err) {
    logger.error('[app]', `🔥 Database migrations failed: ${(err as Error).message}`)
  }
}
