import consola from 'consola'
import { type Kysely } from 'kysely'
import { typeid } from 'typeid-js'
import type { Database } from '~/database/db.schema'
import type { RoleInsert } from '~/database/schemas/role'
import type { RolePermissionInsert } from '~/database/schemas/role_permission'

export default async function seed(db: Kysely<Database>): Promise<void> {
  const now = Math.floor(Date.now() / 1000)

  // Create roles
  const adminRoleId = typeid('role').toString()
  const roles: RoleInsert[] = [
    {
      id: adminRoleId,
      name: 'admin',
      description: 'System Administrator',
      type: 'system',
      isDefault: 1,
      metadata: JSON.stringify({
        scope: 'global',
        priority: 1,
      }),
      createdAt: now,
    },
  ]

  await db.insertInto('sq_roles').values(roles).execute()

  // Assign permissions to roles
  const permissions = await db.selectFrom('sq_permissions').select(['id']).execute()

  const rolePermissions: RolePermissionInsert[] = permissions.map((permission) => ({
    id: typeid('rper').toString(),
    roleId: adminRoleId,
    permissionId: permission.id,
    conditions: JSON.stringify({}),
    createdAt: now,
  }))

  await db.insertInto('sq_role_permissions').values(rolePermissions).execute()
}
