import type { Kysely } from 'kysely'
import { typeid } from 'typeid-js'
import type { Database } from '~/database/db.schema'
import { hashToken } from '~/utils/security'
import { generateRandomStr } from '~/utils/string'

interface CreateApiKeyOptions {
  name: string
  userId: string
  expiresAt?: number | null
  isActive?: boolean
}

export async function createApiKey(db: Kysely<Database>, options: CreateApiKeyOptions) {
  const { name, userId, expiresAt = null, isActive = true } = options

  const id = typeid('api').toString()
  const key = generateRandomStr({ size: 32 })
  const hash = await hashToken(key)
  const createdAt = Math.floor(Date.now() / 1000)

  const apiKey = await db
    .insertInto('sq_api_keys')
    .values({ id, userId, name, key, hash, isActive: isActive ? 1 : 0, expiresAt, createdAt })
    .returningAll()
    .executeTakeFirst()

  return apiKey
}

export async function validateApiKey(db: Kysely<Database>, key: string): Promise<boolean> {
  if (!key) return false

  const now = Math.floor(Date.now() / 1000)

  // Get API key record with active status
  const apiKey = await db
    .selectFrom('sq_api_keys')
    .where('key', '=', key)
    .where('isActive', '=', 1)
    .where((eb) =>
      eb.or([
        eb('expiresAt', 'is', null), // Never expires
        eb.and([eb('expiresAt', 'is not', null), eb('expiresAt', '>', now)]),
      ])
    )
    .select(['id'])
    .executeTakeFirst()

  if (!apiKey) return false

  // Update last used timestamp
  await db.updateTable('sq_api_keys').set({ lastUsedAt: now }).where('id', '=', apiKey.id).execute()

  return true
}
