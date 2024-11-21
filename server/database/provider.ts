import { promises as fs } from 'node:fs'
import type { Kysely, Migration, MigrationProvider } from 'kysely'
import { join, resolve } from 'pathe'
import { env } from 'std-env'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs-lite'
import logger from '~/utils/logger'
import type { Database } from './db.schema'
import { MIGRATION_FOLDER } from './migrator'

export default class SquelifyMigrator implements MigrationProvider {
  private readonly storage: Awaited<ReturnType<typeof createStorage>>
  private readonly resolvedPath: string
  private readonly shouldAutoMigrate: boolean

  constructor(absolutePath: string) {
    // Run migrations by default unless explicitly disabled
    const isRunningFromCLI = (): boolean => process.argv.length > 2
    this.shouldAutoMigrate = !isRunningFromCLI() && env.DATABASE_AUTO_MIGRATE !== 'false'

    // Get database migrations folder
    this.resolvedPath = resolve(import.meta.dirname, absolutePath)

    // Initialize storage with fs driver
    this.storage = createStorage({
      driver: fsDriver({ base: 'assets:migrations' }),
    })
  }

  async getMigrations(): Promise<Record<string, Migration>> {
    if (!this.shouldAutoMigrate) {
      // ESM File Migration mode
      const files = await fs.readdir(this.resolvedPath)
      return Object.fromEntries(
        await Promise.all(
          files
            .filter((fileName) => fileName.endsWith('.ts'))
            .map(async (fileName) => {
              const migrationKey = fileName.slice(0, -3)
              const importPath = join(this.resolvedPath, fileName).replace(/\\/g, '/')
              const migration = await import(/* @vite-ignore */ importPath)
              return [migrationKey, migration.default || migration] as const
            })
        )
      )
    }

    // Automatic Migration mode
    const files = await fs.readdir(MIGRATION_FOLDER)
    const fileExt = process.dev ? '.ts' : '.js'

    const migrationFiles = files
      .filter((file) => file.endsWith(fileExt))
      .sort((a, b) => a.localeCompare(b))

    const migrationEntries = await Promise.all(
      migrationFiles.map(async (fileName) => {
        try {
          const migrationKey = fileName.replace(fileExt, '')
          const importPath = join(MIGRATION_FOLDER, fileName).replace(/\\/g, '/')

          if (process.dev) {
            const content = await this.storage.getItem<{
              up: (db: Kysely<Database>) => Promise<void>
              down: (db: Kysely<Database>) => Promise<void>
            }>(fileName)

            // Debug log untuk melihat struktur content
            logger.debug('[migration]', `Content for ${fileName}:`, content)

            // Cek apakah content adalah string yang perlu di-parse
            if (typeof content === 'string') {
              try {
                const parsedContent = JSON.parse(content)
                return [
                  migrationKey,
                  {
                    up: parsedContent.up,
                    down:
                      parsedContent.down ||
                      (async () => {
                        logger.warn('[migration]', `No down migration for: ${fileName}`)
                      }),
                  },
                ] as const
              } catch (error) {
                logger.error('[migration]', `Failed to parse migration content: ${fileName}`, error)
                return null
              }
            }

            // Fallback ke penanganan original
            if (!content?.up) {
              logger.warn('[migration]', `Invalid migration content: ${fileName}`)
              return null
            }

            return [
              migrationKey,
              {
                up: content.up,
                down:
                  content.down ||
                  (async () => {
                    logger.warn('[migration]', `No down migration for: ${fileName}`)
                  }),
              },
            ] as const
          }

          const migration = require(importPath)
          const migrationModule = migration.default || migration

          if (!migrationModule?.up || typeof migrationModule.up !== 'function') {
            logger.warn('[migration]', `Invalid migration module structure: ${fileName}`)
            return null
          }

          return [
            migrationKey,
            {
              up: migrationModule.up,
              down:
                migrationModule.down ||
                (async () => {
                  logger.warn('[migration]', `No down migration for: ${fileName}`)
                }),
            },
          ] as const
        } catch (error) {
          logger.error('[migration]', `Error loading migration ${fileName}:`, error)
          return null
        }
      })
    )

    const validEntries = migrationEntries.filter(
      (entry): entry is Exclude<typeof entry, null> => entry !== null
    )

    logger.info('[migration]', `Loaded ${validEntries.length} valid migrations`)

    return Object.fromEntries(validEntries)
  }
}
