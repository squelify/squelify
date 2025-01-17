import type { Migration } from 'kysely'

interface DatabaseMigration {
  readonly name: string
  readonly migration: Migration
}

export async function getMigrationItems(): Promise<DatabaseMigration[]> {
  return [
    {
      name: '202303000_create_superusers_table',
      migration: await import('./migrations/202303000_create_superusers_table'),
    },
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
      name: '202303013_create_organizations_table',
      migration: await import('./migrations/202303013_create_organizations_table'),
    },
    {
      name: '202303014_create_roles_table',
      migration: await import('./migrations/202303014_create_roles_table'),
    },
    {
      name: '202303015_create_user_roles_table',
      migration: await import('./migrations/202303015_create_user_roles_table'),
    },
    {
      name: '202303016_create_role_permissions_table',
      migration: await import('./migrations/202303016_create_role_permissions_table'),
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
}
