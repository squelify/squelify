import { type Kysely, sql } from 'kysely'
import { typeid } from 'typeid-js'
import type { Database } from '../db.schema'
import type { JWKInsert, JWKSelect } from '../schemas/jwk'

/**
 * Get currently active JWK for token signing
 * Returns active key or null if no active key exists
 */
export async function getActiveJWK(db: Kysely<Database>): Promise<Partial<JWKSelect> | null> {
  const now = new Date().toISOString()

  const activeKey = await db
    .selectFrom('jwks')
    .where('isActive', '=', 1)
    .where('expiresAt', '>', now)
    .select(['id', 'keyId', 'publicKey', 'privateKey', 'algorithm'])
    .executeTakeFirst()

  return activeKey
}

/**
 * Create new JWK pair
 * Generates new key pair and sets it as active
 */
export async function createJWK(db: Kysely<Database>, keyPair: JWKInsert) {
  return await db
    .insertInto('jwks')
    .values({
      id: typeid('jwk').toString(),
      ...keyPair,
      isActive: 1,
      createdAt: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirst()
}
