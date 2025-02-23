import type { Kysely } from 'kysely'
import type { Database } from '~/database/db.schema'
import { createApiKey } from '~/database/repository/api_key.repo'
import { DURATION } from '~/utils/datetime'

export default async function seed(db: Kysely<Database>): Promise<void> {
  await db.transaction().execute(async (trx) => {
    const admin = await trx
      .selectFrom('_sq_users')
      .where('username', '=', 'admin')
      .select(['id'])
      .executeTakeFirst()

    if (admin) {
      const now = Math.floor(Date.now() / 1000)

      // Create permanent API key for system integration
      await createApiKey(trx, {
        userId: admin.id,
        name: 'System Integration Key',
        expiry: null,
        active: true,
        kind: 'pk',
      })

      // Create temporary API key for testing (90 days)
      await createApiKey(trx, {
        userId: admin.id,
        name: 'Development Testing Key',
        expiry: now + DURATION.DAY * 90,
        active: true,
        kind: 'pk',
      })
    }
  })
}
