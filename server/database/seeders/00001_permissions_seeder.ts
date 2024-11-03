import { type Kysely } from 'kysely'
import { typeid } from 'typeid-js'
import type { Database } from '~/database/db.schema'
import type { PermissionInsert } from '~/database/schemas/permission'

export default async function seed(db: Kysely<Database>): Promise<void> {
  const now = Math.floor(Date.now() / 1000)

  const permissions: PermissionInsert[] = [
    {
      id: typeid('perm').toString(),
      name: 'manage:all',
      description: 'Full system access',
      category: 'system',
      action: 'manage',
      resource: '*',
      conditions: JSON.stringify({}),
      createdAt: now,
    },
    {
      id: typeid('perm').toString(),
      name: 'manage:users',
      description: 'Manage all users',
      category: 'user',
      action: 'manage',
      resource: 'users',
      conditions: JSON.stringify({}),
      createdAt: now,
    },
  ]

  await db.insertInto('permissions').values(permissions).execute()
}
