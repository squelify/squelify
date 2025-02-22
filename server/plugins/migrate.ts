import { existsSync, readFileSync } from 'node:fs'
import { globby } from 'globby'
import { join, resolve } from 'pathe'
import { env } from 'std-env'
import db, { libSQLClient } from '~/database/db.client'
import { runMigration } from '~/database/migrator'
import { validateMigration } from '~/database/validator'
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

    // Execute system migrations
    await runMigration('migrate')

    // Check if application is installed by checking existence of admin user
    const isInstalled = await db
      .selectFrom('_sq_users as users')
      .innerJoin('_sq_user_roles as user_roles', 'user_roles.userId', 'users.id')
      .innerJoin('_sq_roles as roles', 'roles.id', 'user_roles.roleId')
      .where('roles.name', '=', 'admin')
      .where('users.isActive', '=', 1)
      .select('users.id')
      .executeTakeFirst()

    if (!isInstalled) {
      logger.info('[app]', 'Application not installed, skipping user migrations...')
      return
    }

    // Load user migrations
    const migrationDir = resolve(process.cwd(), 'sqdata/migrations')

    // Skip if migrations folder not found
    if (!existsSync(migrationDir)) {
      logger.info('[app]', 'No user migrations folder found, skipping...')
      return
    }

    const userFiles = await globby('**/*.sql', {
      cwd: migrationDir,
    })

    if (userFiles.length === 0) {
      logger.info('[app]', 'No user migration files found, skipping...')
      return
    }

    // Get executed migrations
    const executed = await db
      .selectFrom('_migrations')
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

      // Validate migration
      const filePath = join(migrationDir, file)
      const validation = validateMigration(filePath)

      if (!validation.isValid) {
        logger.trace('[app]', `Migration ${file} validation failed:`, validation.errors)
        if (validation.warnings.length > 0) {
          logger.error('[app]', `Migration validation failed:`, validation.warnings)
        }
        continue
      }

      const migrationName = file.replace('.sql', '')
      const sqlContent = readFileSync(join(migrationDir, file), 'utf-8')

      // Log the migration content for debugging
      logger.info('[migration]', 'Executing user migration:', migrationName)

      // Execute SQL using LibSQL Client
      await libSQLClient.executeMultiple(sqlContent)

      // Save the migration status to the database
      await db
        .insertInto('_migrations')
        .values({
          name: migrationName,
          checksum: validation.checksum,
          executedAt: Math.floor(Date.now() / 1000),
        })
        .execute()

      logger.info('[migration]', `Migration ${migrationName} executed successfully`)
    }

    migrationExecuted = true
    logger.info('[app]', 'Database migrations completed')
  } catch (err) {
    logger.error('[app]', `🔥 Database migrations failed: ${(err as Error).message}`)
  }
})
