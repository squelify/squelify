import { Kysely, sql } from 'kysely'
import { typeid } from 'typeid-js'
import type { Database } from '~/database/db.schema'
import { RATE_LIMIT_DEFAULTS } from '~/database/schemas/rate_limit'
import type { RateLimitContext, RateLimitInsert } from '~/database/schemas/rate_limit'

interface RateLimitInfo {
  isLimited: boolean
  remainingPoints: number
  resetAt: number | null
  blockedUntil: number | null
}

export async function createRateLimit(
  db: Kysely<Database>,
  key: string,
  context: RateLimitContext,
  limit: number = RATE_LIMIT_DEFAULTS.POINTS,
  window: number = RATE_LIMIT_DEFAULTS.WINDOW
): Promise<RateLimitInfo> {
  const now = Math.floor(Date.now() / 1000)
  const data: RateLimitInsert = {
    id: typeid('ratelim').toString(),
    key,
    context,
    points: 1,
    limit,
    window,
    expiresAt: now + window,
    createdAt: now,
  }

  // Cleanup expired records first for better performance
  await cleanupExpiredRecords(db, now)

  try {
    await db
      .insertInto('sq_rate_limits')
      .values(data)
      .onConflict((oc) =>
        oc.columns(['key', 'context']).doUpdateSet({
          points: sql`CASE
            WHEN expires_at < ${now} THEN 1
            ELSE points + 1
          END`,
          expiresAt: sql`CASE
            WHEN expires_at < ${now} THEN ${now + window}
            ELSE expires_at
          END`,
          blockedUntil: sql`CASE
            WHEN points + 1 >= ${limit * RATE_LIMIT_DEFAULTS.BLOCK_MULTIPLIER} THEN ${now + window * RATE_LIMIT_DEFAULTS.BLOCK_MULTIPLIER}
            ELSE blocked_until
          END`,
        })
      )
      .execute()

    return await getRateLimitInfo(db, key, context)
  } catch (error) {
    logger.error('[RateLimit] Failed to create/update rate limit:', { key, context, error })
    throw createError({ statusCode: 500, message: 'Failed to process rate limit' })
  }
}

async function cleanupExpiredRecords(db: Kysely<Database>, now: number): Promise<void> {
  await db
    .deleteFrom('sq_rate_limits')
    .where('expiresAt', '<', now)
    .where('blockedUntil', 'is', null)
    .execute()
}

export async function getRateLimitInfo(
  db: Kysely<Database>,
  key: string,
  context: RateLimitContext
): Promise<RateLimitInfo> {
  const now = Math.floor(Date.now() / 1000)

  try {
    const limit = await db
      .selectFrom('sq_rate_limits')
      .where('key', '=', key)
      .where('context', '=', context)
      .where((eb) => eb.or([eb('expiresAt', '>', now), eb('blockedUntil', '>', now)]))
      .select(['points', 'limit', 'blockedUntil', 'expiresAt'])
      .executeTakeFirst()

    if (!limit) {
      return {
        isLimited: false,
        remainingPoints: 0,
        resetAt: null,
        blockedUntil: null,
      }
    }

    const isBlocked = limit.blockedUntil ? limit.blockedUntil > now : false
    const isLimited = isBlocked || limit.points >= limit.limit

    return {
      isLimited,
      remainingPoints: Math.max(0, limit.limit - limit.points),
      resetAt: limit.expiresAt,
      blockedUntil: limit.blockedUntil,
    }
  } catch (error) {
    logger.error('[RateLimit] Failed to get rate limit info:', { key, context, error })
    throw createError({ statusCode: 500, message: 'Failed to check rate limit' })
  }
}
export async function clearRateLimit(
  db: Kysely<Database>,
  key: string,
  context: RateLimitContext
): Promise<void> {
  try {
    await db
      .deleteFrom('sq_rate_limits')
      .where('key', '=', key)
      .where('context', '=', context)
      .execute()
  } catch (error) {
    logger.error('[RateLimit] Failed to clear rate limit:', { key, context, error })
    throw createError({ statusCode: 500, message: 'Failed to clear rate limit' })
  }
}
