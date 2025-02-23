import consola from 'consola'
import type { Kysely } from 'kysely'
import { typeid } from 'typeid-js'
import type { Database } from '~/database/db.schema'
import { hashToken } from '~/utils/security'
import { generateRandomStr } from '~/utils/string'

// pk : Publishable Key (public)
// sk : Secret Key
interface CreateApiKeyOptions {
  name: string
  userId: string
  expiry?: number | null
  active?: boolean
  kind?: 'pk' | 'sk'
}

// Custom error class for API key operations
export class ApiKeyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiKeyError'
  }
}

export async function createApiKey(db: Kysely<Database>, options: CreateApiKeyOptions) {
  const { name, userId, expiry = null, active = true, kind = 'pk' } = options

  if (!name) {
    throw new ApiKeyError('API key name is required')
  }

  if (!userId) {
    throw new ApiKeyError('User ID is required')
  }

  if (!['pk', 'sk'].includes(kind)) {
    throw new ApiKeyError('Invalid API key type. Must be either "pk" or "sk"')
  }

  if (expiry !== null && expiry <= Math.floor(Date.now() / 1000)) {
    throw new ApiKeyError('Expiry time must be in the future')
  }

  try {
    const createdAt = Math.floor(Date.now() / 1000)
    const id = typeid('key').toString()
    const isActive = active ? 1 : 0

    // This token is used to authenticate API requests.
    const randomStr = generateRandomStr({ size: 32 })
    const keyData = `${randomStr}.${createdAt}.${expiry || 0}`
    const encodedKey = Buffer.from(keyData).toString('base64url')
    const key = `${kind}_${encodedKey}`
    const hash = await hashToken(key)

    const apiKey = await db
      .insertInto('_sq_api_keys')
      .values({ id, userId, name, key, hash, isActive, expiresAt: expiry, createdAt })
      .onConflict((oc) => oc.column('key').doNothing())
      .returningAll()
      .executeTakeFirst()

    if (!apiKey) {
      throw new ApiKeyError('Failed to create API key - duplicate key detected')
    }

    return apiKey
  } catch (error) {
    consola.error('Failed to create API key', error)
    if (error instanceof ApiKeyError) {
      throw error
    }
    throw new ApiKeyError('Failed to create API key')
  }
}

// Custom error class for API key validation
export class ApiKeyValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiKeyValidationError'
  }
}

export async function validateApiKey(db: Kysely<Database>, key: string): Promise<boolean> {
  if (!key) {
    throw new ApiKeyValidationError('API key is required')
  }

  try {
    // Extract prefix (pk_ or sk_)
    const [kind, encodedPart] = key.split('_')
    if (!encodedPart || !['pk', 'sk'].includes(kind)) {
      throw new ApiKeyValidationError('Invalid API key format')
    }

    // Decode key data
    const decodedKey = Buffer.from(encodedPart, 'base64url').toString()
    const [randomStr, createdAt, expiresAt] = decodedKey.split('.')

    if (!randomStr || !createdAt) {
      throw new ApiKeyValidationError('Malformed API key')
    }

    const now = Math.floor(Date.now() / 1000)
    const expiry = Number(expiresAt) || 0

    // Validate expiry if exists
    if (expiry > 0 && now > expiry) {
      throw new ApiKeyValidationError('API key has expired')
    }

    // Get API key record with active status
    const apiKey = await db
      .selectFrom('_sq_api_keys')
      .where('key', '=', key)
      .where('isActive', '=', 1)
      .where((eb) =>
        eb.or([
          eb('expiresAt', 'is', null) /* Never expires */,
          eb.and([eb('expiresAt', 'is not', null), eb('expiresAt', '>', now)]),
        ]),
      )
      .select(['id'])
      .executeTakeFirst()

    if (!apiKey) {
      throw new ApiKeyValidationError('Invalid or inactive API key')
    }

    // Update last used timestamp
    await db
      .updateTable('_sq_api_keys')
      .set({ lastUsedAt: now })
      .where('id', '=', apiKey.id)
      .execute()

    return true
  } catch (error) {
    if (error instanceof ApiKeyValidationError) {
      throw error
    }
    throw new ApiKeyValidationError('Failed to validate API key')
  }
}
