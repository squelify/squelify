import { promises as fs } from 'node:fs'
import type { MigrationProvider } from 'kysely'
import type { Migration } from 'kysely'
import { join, resolve } from 'pathe'

export class ESMFileMigrationProvider implements MigrationProvider {
  private readonly resolvedPath: string

  constructor(absolutePath: string) {
    this.resolvedPath = resolve(import.meta.dirname, absolutePath)
  }

  async getMigrations(): Promise<Record<string, Migration>> {
    const files = await fs.readdir(this.resolvedPath)
    return Object.fromEntries(
      await Promise.all(
        files
          .filter((fileName) => fileName.endsWith('.ts'))
          .map(async (fileName) => {
            const migrationKey = fileName.slice(0, -3) // Remove file extensions
            const importPath = join(this.resolvedPath, fileName).replace(/\\/g, '/')
            const migration = await import(/* @vite-ignore */ importPath)
            return [migrationKey, migration.default || migration] as const
          })
      )
    )
  }
}

export class AutomaticMigrateProvider implements MigrationProvider {
  private readonly storage = useStorage('assets:migrations')

  async getMigrations(): Promise<Record<string, Migration>> {
    const files = await this.storage.getKeys()

    // Filter hanya file .ts dan urutkan berdasarkan nama
    const sortedFiles = files.filter((f) => f.endsWith('.ts')).sort((a, b) => a.localeCompare(b))

    const migrationEntries = await Promise.all(
      sortedFiles.map(async (key) => {
        const content = await this.storage.getItem<Migration>(key)
        const migrationKey = key.replace(/\.ts$/, '')

        if (!content || typeof content.up !== 'function') {
          logger.warn('[migration]', `Invalid migration file: ${key}`)
          return null
        }

        // Pastikan method up dan down ada
        return [
          migrationKey,
          {
            up: content.up,
            down: content.down || (async () => {}),
          },
        ] as const
      })
    )

    // Filter null entries
    const validEntries = migrationEntries.filter(
      (entry): entry is Exclude<typeof entry, null> => entry !== null
    )

    logger.info('[migration]', `Found ${validEntries.length} valid migrations`)

    return Object.fromEntries(validEntries)
  }
}
