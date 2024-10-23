import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { MigrationProvider } from 'kysely'
import type { Migration } from 'kysely'

export class ESMFileMigrationProvider implements MigrationProvider {
  private readonly resolvedPath: string

  constructor(absolutePath: string) {
    this.resolvedPath = path.resolve(import.meta.dirname, absolutePath)
  }

  async getMigrations(): Promise<Record<string, Migration>> {
    const files = await fs.readdir(this.resolvedPath)
    return Object.fromEntries(
      await Promise.all(
        files
          .filter((fileName) => fileName.endsWith('.ts'))
          .map(async (fileName) => {
            const migrationKey = fileName.slice(0, -3) // Remove file extensions
            const importPath = path.join(this.resolvedPath, fileName).replace(/\\/g, '/')
            const migration = await import(/* @vite-ignore */ importPath)
            return [migrationKey, migration.default || migration] as const
          })
      )
    )
  }
}

export class AutomaticMigrateProvider implements MigrationProvider {
  private migrations: Record<string, Migration>

  constructor() {
    const migrationFiles = import.meta.glob('../migrations/*.ts', { eager: true })
    this.migrations = Object.fromEntries(
      Object.entries(migrationFiles).map(([key, value]) => [
        key.replace('../migrations/', '').replace('.ts', ''),
        (value as { default?: Migration }).default || (value as Migration),
      ])
    )
  }

  async getMigrations(): Promise<Record<string, Migration>> {
    return this.migrations
  }
}
