import { env } from 'std-env'
import { runMigration } from '~/database/migrator'

// Flag to indicate whether the migration has been carried out.
let migrationExecuted = false

/**
 * Automatically runs database migrations on application startup.
 * This will run by default unless explicitly disabled by setting
 * DATABASE_AUTO_MIGRATE=false. Migration runs only once when the
 * application starts.
 */
export default defineNitroPlugin(async (_nitroApp) => {
  if (migrationExecuted) return

  // Run migrations by default unless explicitly disabled
  const shouldAutoMigrate = env.DATABASE_AUTO_MIGRATE !== 'false'

  if (!shouldAutoMigrate) return

  try {
    logger.info('[app]', 'Running database migrations...')
    await runMigration('migrate')
    migrationExecuted = true
  } catch (err) {
    logger.error('[app]', `🔥 Database migrations failed: ${(err as Error).message}`)
  }
})
