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
  private migrations: Record<string, Migration>
  private readonly migrationsPath: string

  constructor() {
    this.migrationsPath = resolve(import.meta.dirname, '../migrations')
    this.migrations = {}
  }

  async getMigrations(): Promise<Record<string, Migration>> {
    const files = await fs.readdir(this.migrationsPath)

    this.migrations = Object.fromEntries(
      await Promise.all(
        files
          .filter((fileName) => fileName.endsWith('.ts'))
          .map(async (fileName) => {
            const migrationKey = fileName.replace('.ts', '')
            const importPath = join(this.migrationsPath, fileName).replace(/\\/g, '/')
            const migration = await import(/* @vite-ignore */ importPath)
            return [migrationKey, migration.default || migration] as const
          })
      )
    )

    return this.migrations
  }
}
