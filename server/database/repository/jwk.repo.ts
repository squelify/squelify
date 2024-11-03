import * as jose from 'jose'
import { type Kysely } from 'kysely'
import { typeid } from 'typeid-js'
import type { Database } from '../db.schema'
import type { JWK, JWKAlgorithm, JWKInsert } from '../schemas/jwk'

/**
 * Get currently active JWK for token signing
 * Returns active key or null if no active key exists
 */
export async function getActiveJWK(db: Kysely<Database>): Promise<Partial<JWK> | null> {
  const now = Math.floor(Date.now() / 1000)

  // Get the most recently created active JWK
  return await db
    .selectFrom('jwks')
    .where('isActive', '=', 1)
    .where('expiresAt', '>', now)
    .select(['id', 'keyId', 'publicKey', 'privateKey', 'algorithm', 'expiresAt'])
    .orderBy('createdAt', 'desc')
    .limit(1)
    .executeTakeFirst()
}

/**
 * Get JWK by key ID for token verification
 */
export async function getJWKByKeyId(
  db: Kysely<Database>,
  keyId: string
): Promise<Partial<JWK> | null> {
  const now = Math.floor(Date.now() / 1000)

  return await db
    .selectFrom('jwks')
    .where('keyId', '=', keyId)
    .where('isActive', '=', 1)
    .where('expiresAt', '>', now)
    .select(['id', 'keyId', 'publicKey', 'privateKey', 'algorithm', 'expiresAt'])
    .executeTakeFirst()
}

/**
 * Generate new JWK pair and set as active
 */
export async function rotateJWK(db: Kysely<Database>): Promise<JWK> {
  const now = Math.floor(Date.now() / 1000)

  // Generate new key pair
  const { publicKey, privateKey } = await jose.generateKeyPair('ES256')
  const publicKeyString = await jose.exportSPKI(publicKey)
  const privateKeyString = await jose.exportPKCS8(privateKey)

  // Create new JWK record
  const newKey: JWKInsert = {
    id: typeid('jwk').toString(),
    keyId: typeid('kid').toString(),
    publicKey: publicKeyString,
    privateKey: privateKeyString,
    algorithm: 'ES256' as JWKAlgorithm,
    isActive: 1,
    expiresAt: now + 30 * 24 * 60 * 60, // 30 days
    createdAt: now,
  }

  // Insert new key and deactivate old keys in transaction
  return await db.transaction().execute(async (trx) => {
    // Deactivate old keys
    await trx
      .updateTable('jwks')
      .set({ isActive: 0, updatedAt: now })
      .where('isActive', '=', 1)
      .execute()

    // Insert new key
    return await trx.insertInto('jwks').values(newKey).returningAll().executeTakeFirstOrThrow()
  })
}

/**
 * Clean up expired JWKs
 */
export async function cleanupExpiredJWKs(db: Kysely<Database>): Promise<void> {
  const now = Math.floor(Date.now() / 1000)

  await db.deleteFrom('jwks').where('expiresAt', '<=', now).where('isActive', '=', 0).execute()
}
