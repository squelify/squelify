import { Kysely, sql } from 'kysely'
import { typeid } from 'typeid-js'
import { Database } from '~/database/db.schema'
import { RateLimitContext, RateLimitInsert } from '~/database/schemas/rate_limit'

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
  limit: number,
  window: number
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

  try {
    await db
      .insertInto('rate_limits')
      .values(data)
      .onConflict((oc) =>
        oc.columns(['key', 'context']).doUpdateSet({
          points: sql`points + 1`,
          expiresAt: now + window,
        })
      )
      .execute()

    return await getRateLimitInfo(db, key, context)
  } catch (error) {
    logger.error('[RateLimit] Failed to create/update rate limit:', { key, context, error })
    throw createError({
      statusCode: 500,
      message: 'Failed to process rate limit',
    })
  }
}

export async function getRateLimitInfo(
  db: Kysely<Database>,
  key: string,
  context: RateLimitContext
): Promise<RateLimitInfo> {
  const now = Math.floor(Date.now() / 1000)

  try {
    const limit = await db
      .selectFrom('rate_limits')
      .where('key', '=', key)
      .where('context', '=', context)
      .where('expiresAt', '>', now)
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

    return {
      isLimited: limit.blockedUntil ? limit.blockedUntil > now : limit.points >= limit.limit,
      remainingPoints: Math.max(0, limit.limit - limit.points),
      resetAt: limit.expiresAt,
      blockedUntil: limit.blockedUntil,
    }
  } catch (error) {
    logger.error('[RateLimit] Failed to get rate limit info:', { key, context, error })
    throw createError({
      statusCode: 500,
      message: 'Failed to check rate limit',
    })
  }
}

export async function checkRateLimit(
  db: Kysely<Database>,
  key: string,
  context: RateLimitContext
): Promise<boolean> {
  try {
    const info = await getRateLimitInfo(db, key, context)
    return info.isLimited
  } catch (error) {
    logger.error('[RateLimit] Failed to check rate limit:', { key, context, error })
    return false // Fail open to prevent blocking legitimate traffic
  }
}

export async function clearRateLimit(
  db: Kysely<Database>,
  key: string,
  context: RateLimitContext
): Promise<void> {
  try {
    await db
      .deleteFrom('rate_limits')
      .where('key', '=', key)
      .where('context', '=', context)
      .execute()
  } catch (error) {
    logger.error('[RateLimit] Failed to clear rate limit:', { key, context, error })
    throw createError({
      statusCode: 500,
      message: 'Failed to clear rate limit',
    })
  }
}
