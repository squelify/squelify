import { promises as fs } from 'node:fs'
import type { Migration, MigrationProvider } from 'kysely'
import { join, resolve } from 'pathe'
import { env } from 'std-env'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs-lite'

interface DatabaseMigration {
  readonly name: string
  readonly migration: Migration
}

export default class NitroMigrator implements MigrationProvider {
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
      driver: fsDriver({ base: this.resolvedPath }),
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
    // const migrationKeys = await this.storage.getKeys()
    // const migrationItems = migrationKeys.map((key) => key.slice(0, -3))

    // TODO: improve this to automatically detect migrations from storage
    const importedMigrations: DatabaseMigration[] = [
      {
        name: '202412001_initialize_schema',
        migration: await import('./migrations/202412001_initialize_schema'),
      },
    ]

    const migrationEntries = await Promise.all(
      importedMigrations.map(async ({ name, migration }) => {
        return [name, migration] as const
      })
    )

    return Object.fromEntries(migrationEntries)
  }
}
