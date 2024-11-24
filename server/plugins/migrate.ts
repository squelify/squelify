import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'pathe'
import { env } from 'std-env'
import db, { libSQLClient } from '~/database/db.client'
import logger from '~/utils/logger'

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

  const shouldAutoMigrate = env.DATABASE_AUTO_MIGRATE !== 'false'

  if (!shouldAutoMigrate) {
    logger.info('[app]', 'Skipped automatic database migration')
    return
  }

  try {
    logger.info('[app]', 'Running database migrations...')

    // Load user migrations
    const userPath = resolve(process.cwd(), '_data/migrations')

    // Skip if migrations folder not found
    if (!existsSync(userPath)) {
      logger.info('[app]', 'No user migrations folder found, skipping...')
      return
    }

    const userFiles = readdirSync(userPath)
      .filter((f) => f.endsWith('.sql'))
      .sort()

    if (userFiles.length === 0) {
      logger.info('[app]', 'No user migration files found, skipping...')
      return
    }

    // Get executed migrations
    const executed = await db
      .selectFrom('sq_migrations')
      .select('name')
      .execute()
      .then((rows) => rows.map((r) => r.name))

    // Check if all migrations are executed
    const pendingMigrations = userFiles.filter(
      (file) => !executed.includes(file.replace('.sql', ''))
    )

    if (pendingMigrations.length === 0) {
      logger.info('[app]', 'All migrations are up to date')
      return
    }

    // Execute pending migrations
    for (const file of userFiles) {
      if (executed.includes(file)) continue

      const migrationName = file.replace('.sql', '')
      const executedAt = Math.floor(Date.now() / 1000)
      const sqlContent = readFileSync(join(userPath, file), 'utf-8')

      // Log the migration content for debugging
      logger.info('[migration]', 'Executing user migration:', migrationName)

      // Execute SQL using LibSQL Client
      await libSQLClient.executeMultiple(sqlContent)

      // Save the migration status to the database
      await db.insertInto('sq_migrations').values({ name: migrationName, executedAt }).execute()

      logger.info('[migration]', `Migration ${migrationName} executed successfully`)
    }

    migrationExecuted = true
    logger.info('[app]', 'Database migrations completed')
  } catch (err) {
    logger.error('[app]', `🔥 Database migrations failed: ${(err as Error).message}`)
  }
})
