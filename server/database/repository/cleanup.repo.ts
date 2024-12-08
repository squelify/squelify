import { Kysely, sql } from 'kysely'
import type { Database } from '~/database/db.schema'

/**
 * Cleans up expired and inactive sessions from the database.
 *
 * This function deletes sessions from the 'sessions' table that meet the following criteria:
 * - The session has expired (the `expiresAt` timestamp is in the past).
 * - The session is inactive (the `isActive` flag is 0) and the `lastActiveAt` timestamp is older than 30 days.
 *
 * @param db - The Kysely database instance to use for the cleanup operation.
 * @returns A Promise that resolves when the cleanup operation is complete.
 */
export async function cleanupSessions(db: Kysely<Database>): Promise<void> {
  const now = Math.floor(Date.now() / 1000)

  await db
    .deleteFrom('sq_sessions')
    .where((eb) =>
      eb.or([
        eb('expiresAt', '<', now),
        eb.and([
          eb('isActive', '=', 0),
          eb('lastActiveAt', '<', now - 86400 * 30), // 30 days
        ]),
      ])
    )
    .execute()
}

/**
 * Cleans up expired and blocked rate limit entries from the database.
 *
 * This function deletes rate limit entries from the 'rate_limits' table that meet the following criteria:
 * - The rate limit has expired (the `expiresAt` timestamp is in the past) and the user is not currently blocked.
 * - The user is currently blocked (the `blockedUntil` timestamp is in the past).
 *
 * @param db - The Kysely database instance to use for the cleanup operation.
 * @returns A Promise that resolves when the cleanup operation is complete.
 */
export async function cleanupRateLimits(db: Kysely<Database>): Promise<void> {
  const now = Math.floor(Date.now() / 1000)

  await db
    .deleteFrom('sq_rate_limits')
    .where((eb) =>
      eb.or([
        eb.and([eb('expiresAt', '<', now), eb('blockedUntil', 'is', null)]),
        eb('blockedUntil', '<', now),
      ])
    )
    .execute()
}

export async function cleanupAuditLog(db: Kysely<Database>): Promise<void> {
  const now = Math.floor(Date.now() / 1000)

  // Batch delete to prevent blocking
  const BATCH_SIZE = 1000

  while (true) {
    const deleted = await db
      .deleteFrom('sq_audit_logs')
      .where((eb) => eb.val(sql`created_at + retention`), '<', now)
      .execute()

    if (deleted.length < BATCH_SIZE) break

    // Small delay between batches
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}
