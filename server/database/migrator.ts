import { Kysely, Migrator, NO_MIGRATIONS } from 'kysely'
import { join } from 'pathe'
import { env } from 'std-env'
import { kyselyConfig } from '~/database/db.client'
import type { Database } from '~/database/db.schema'
import SquelifyMigrator from '~/database/provider'

export const MIGRATION_FOLDER = join(process.cwd(), 'server/database/migrations')
export const SEEDER_FOLDER = join(process.cwd(), 'server/database/seeders')

type MigrationAction = 'migrate' | 'rollback' | 'reset'

const migrateDBClient = new Kysely<Database>({
  ...kyselyConfig,
  log: env.SQUELIFY_LOG_LEVEL === 'trace' ? ['error', 'query'] : ['error'],
})

export const migrateClient = new Migrator({
  db: migrateDBClient,
  provider: new SquelifyMigrator(MIGRATION_FOLDER),
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
      { name: 'permissions', seeder: await import('./seeders/00001_permissions_seeder') },
      { name: 'roles', seeder: await import('./seeders/00002_roles_seeder') },
      { name: 'users', seeder: await import('./seeders/00003_user_seeder') },
      { name: 'jwks', seeder: await import('./seeders/00004_jwk_seeder') },
      { name: 'api_keys', seeder: await import('./seeders/00005_api_key_seeder') },
    ]

    if (seeders.length > 0) {
      for (const { name, seeder } of seeders) {
        console.info(`🍀 Seeding table ${name}...`)
        await seeder.default(migrateDBClient)
      }
      console.info('🍀 Database seeding completed')
    } else {
      console.info('🍀 No seeders provided. Skipping database seeding.')
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('🔥 Database seeding failed:', errMsg)
    throw error
  }
}

// Helper function to check if the script is running from the CLI
const isRunningFromCLI = (): boolean => process.argv.length > 2

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
