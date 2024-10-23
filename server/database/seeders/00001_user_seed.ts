import type { Kysely } from 'kysely'
import { typeid } from 'typeid-js'
import type { Database } from '~/database/db.schema'
import type { AccountInsert } from '~/database/schemas/account'
import type { UserInsert } from '~/database/schemas/user'
import { hashPassword } from '~/utils/string'

export default async function seed(db: Kysely<Database>): Promise<void> {
  const newUsers: UserInsert[] = [
    {
      id: typeid('user').toString(),
      email: 'admin@example.com',
      name: 'Admin Sistem',
      username: 'admin',
      emailVerified: true,
      diggestSubscribed: false,
      role: 'admin',
    },
  ]

  await db.transaction().execute(async (trx) => {
    const hashed_password = await hashPassword('@Passw0rd$123')

    const users = await trx
      .insertInto('users')
      .values(newUsers)
      .returning(['id', 'email'])
      .onConflict((oc) => oc.column('email').doNothing())
      .execute()

    // Create authentication key for Lucia Auth
    const userAccount: AccountInsert[] = users.map((item) => ({
      id: typeid('acc').toString(),
      userId: item.id,
      accountId: item.id,
      providerId: 'credential',
      password: hashed_password,
    }))

    return await trx.insertInto('accounts').values(userAccount).execute()
  })
}
