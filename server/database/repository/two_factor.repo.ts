import { Kysely } from 'kysely'
import type { Database } from '~/database/db.schema'

export async function getUserActiveTwoFactors(db: Kysely<Database>, userId: string) {
  return db
    .selectFrom('two_factors')
    .where('userId', '=', userId)
    .where('verifiedAt', '!=', null)
    .select(['id', 'type', 'name', 'isPrimary'])
    .execute()
}

export async function setPrimaryTwoFactor(
  db: Kysely<Database>,
  userId: string,
  twoFactorId: string
) {
  return db.transaction().execute(async (trx) => {
    await trx
      .updateTable('two_factors')
      .set({ isPrimary: 0 })
      .where('userId', '=', userId)
      .execute()

    await trx
      .updateTable('two_factors')
      .set({ isPrimary: 1 })
      .where('id', '=', twoFactorId)
      .where('userId', '=', userId)
      .execute()
  })
}
