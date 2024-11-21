import { env } from 'std-env'
import { migrateDBClient, runMigration } from '~/database/migrator'

/**
 * Automatically runs database migrations on application startup.
 * This will run by default unless explicitly disabled by setting
 * DATABASE_AUTO_MIGRATE=false. Migration runs only once when the
 * application starts.
 *
 * This flag indicate whether the migration has been carried out.
 */
let migrationExecuted = false

export default defineNitroPlugin(async (_nitroApp) => {
  if (migrationExecuted) return

  // Run migrations by default unless explicitly disabled
  const shouldAutoMigrate = env.DATABASE_AUTO_MIGRATE !== 'false'

  if (!shouldAutoMigrate) {
    logger.info('[app]', 'Skipped automatic database migration')
    return
  }

  try {
    logger.info('[app]', 'Running database migrations...')
    await runMigration('migrate')
    migrationExecuted = true
  } catch (err) {
    logger.error('[app]', `🔥 Database migrations failed: ${(err as Error).message}`)
  }
})
