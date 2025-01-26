import { Kysely } from 'kysely'
import type { Database } from '~/database/db.schema'
import { DURATION } from '~/utils/datetime'

export async function cleanupExpiredSessions(db: Kysely<Database>) {
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - DURATION.DAY * 30

  return await db.deleteFrom('_sq_sessions').where('archivedAt', '<=', thirtyDaysAgo).execute()
}
