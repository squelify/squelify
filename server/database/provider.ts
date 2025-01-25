import { globby } from 'globby'
import type { Migration, MigrationProvider } from 'kysely'
import { join, resolve } from 'pathe'
import { env } from 'std-env'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs-lite'
import { getMigrationItems } from './automigrate'

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
      driver: fsDriver({ base: this.resolvedPath }),
    })
  }

  async getMigrations(): Promise<Record<string, Migration>> {
    // ESM File Migration mode
    if (!this.shouldAutoMigrate) {
      const files = await globby('**/*.ts', {
        cwd: this.resolvedPath,
      })

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

    // TODO: improve this to automatically detect migrations from storage
    // Automatic Migration mode (run when app is started)
    const migrationItems = await getMigrationItems()
    const migrationEntries = await Promise.all(
      migrationItems.map(async ({ name, migration }) => [name, migration])
    )

    return Object.fromEntries(migrationEntries)
  }
}
