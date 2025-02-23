import type { Kysely } from 'kysely'
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

  // Insert roles dengan onConflict
  await db
    .insertInto('_sq_roles')
    .values(roles)
    .onConflict((oc) => oc.column('name').doNothing())
    .execute()

  // Dapatkan role yang sudah ada
  const existingRole = await db
    .selectFrom('_sq_roles')
    .where('name', '=', 'admin')
    .select(['id'])
    .executeTakeFirst()

  if (!existingRole) return

  // Assign permissions ke role yang sudah ada
  const permissions = await db.selectFrom('_sq_permissions').select(['id']).execute()

  const rolePermissions: RolePermissionInsert[] = permissions.map((permission) => ({
    id: typeid('rper').toString(),
    roleId: existingRole.id,
    permissionId: permission.id,
    conditions: JSON.stringify({}),
    createdAt: now,
  }))

  await db
    .insertInto('_sq_role_permissions')
    .values(rolePermissions)
    .onConflict((oc) => oc.columns(['roleId', 'permissionId']).doNothing())
    .execute()
}
