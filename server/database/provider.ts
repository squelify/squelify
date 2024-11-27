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
        name: '202303001_create_users_table',
        migration: await import('./migrations/202303001_create_users_table'),
      },
      {
        name: '202303002_create_user_metadata_table',
        migration: await import('./migrations/202303002_create_user_metadata_table'),
      },
      {
        name: '202303003_create_emails_table',
        migration: await import('./migrations/202303003_create_emails_table'),
      },
      {
        name: '202303004_create_accounts_table',
        migration: await import('./migrations/202303004_create_accounts_table'),
      },
      {
        name: '202303005_create_passwords_table',
        migration: await import('./migrations/202303005_create_passwords_table'),
      },
      {
        name: '202303006_create_jwks_table',
        migration: await import('./migrations/202303006_create_jwks_table'),
      },
      {
        name: '202303007_create_sessions_table',
        migration: await import('./migrations/202303007_create_sessions_table'),
      },
      {
        name: '202303008_create_rate_limits_table',
        migration: await import('./migrations/202303008_create_rate_limits_table'),
      },
      {
        name: '202303009_create_verifications_table',
        migration: await import('./migrations/202303009_create_verifications_table'),
      },
      {
        name: '202303010_create_two_factors_table',
        migration: await import('./migrations/202303010_create_two_factors_table'),
      },
      {
        name: '202303011_create_passkeys_table',
        migration: await import('./migrations/202303011_create_passkeys_table'),
      },
      {
        name: '202303012_create_permissions_table',
        migration: await import('./migrations/202303012_create_permissions_table'),
      },
      {
        name: '202303013_create_roles_table',
        migration: await import('./migrations/202303013_create_roles_table'),
      },
      {
        name: '202303014_create_role_permissions_table',
        migration: await import('./migrations/202303014_create_role_permissions_table'),
      },
      {
        name: '202303015_create_user_roles_table',
        migration: await import('./migrations/202303015_create_user_roles_table'),
      },
      {
        name: '202303016_create_organizations_table',
        migration: await import('./migrations/202303016_create_organizations_table'),
      },
      {
        name: '202303017_create_members_table',
        migration: await import('./migrations/202303017_create_members_table'),
      },
      {
        name: '202303018_create_invitations_table',
        migration: await import('./migrations/202303018_create_invitations_table'),
      },
      {
        name: '202303019_create_audit_logs_table',
        migration: await import('./migrations/202303019_create_audit_logs_table'),
      },
      {
        name: '202303020_create_user_bans_table',
        migration: await import('./migrations/202303020_create_user_bans_table'),
      },
      {
        name: '202303021_create_api_keys_table',
        migration: await import('./migrations/202303021_create_api_keys_table'),
      },
      {
        name: '202303022_create_user_migration_table',
        migration: await import('./migrations/202303022_create_user_migration_table'),
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
