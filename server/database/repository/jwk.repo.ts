import * as jose from 'jose'
import { type Kysely } from 'kysely'
import { typeid } from 'typeid-js'
import type { Database } from '~/database/db.schema'
import type { JWK, JWKAlgorithm, JWKInsert } from '~/database/schemas/jwk'

export async function getActiveJWK(db: Kysely<Database>): Promise<Partial<JWK> | null> {
  const now = Math.floor(Date.now() / 1000)

  return await db
    .selectFrom('sq_jwks')
    .where('isActive', '=', 1)
    .where('expiresAt', '>', now)
    .select(['id', 'keyId', 'publicKey', 'privateKey', 'algorithm', 'expiresAt'])
    .orderBy('createdAt', 'desc')
    .limit(1)
    .executeTakeFirst()
}

export async function getJWKByKeyId(
  db: Kysely<Database>,
  keyId: string
): Promise<Partial<JWK> | null> {
  const now = Math.floor(Date.now() / 1000)

  return await db
    .selectFrom('sq_jwks')
    .where('keyId', '=', keyId)
    .where('isActive', '=', 1)
    .where('expiresAt', '>', now)
    .select(['id', 'keyId', 'publicKey', 'privateKey', 'algorithm', 'expiresAt'])
    .executeTakeFirst()
}

export async function rotateJWK(db: Kysely<Database>): Promise<JWK> {
  const now = Math.floor(Date.now() / 1000)

  const { publicKey, privateKey } = await jose.generateKeyPair('ES256')
  const publicKeyString = await jose.exportSPKI(publicKey)
  const privateKeyString = await jose.exportPKCS8(privateKey)

  return await db.transaction().execute(async (trx) => {
    // Deactivate old keys
    await trx
      .updateTable('sq_jwks')
      .set({ isActive: 0, updatedAt: now })
      .where('isActive', '=', 1)
      .execute()

    // Insert new key
    const newKey: JWKInsert = {
      id: typeid('jwk').toString(),
      keyId: typeid('kid').toString(),
      publicKey: publicKeyString,
      privateKey: privateKeyString,
      algorithm: 'ES256' as JWKAlgorithm,
      isActive: 1,
      expiresAt: now + TOKEN_DURATION.jwk,
      createdAt: now,
    }

    return await trx.insertInto('sq_jwks').values(newKey).returningAll().executeTakeFirstOrThrow()
  })
}

export async function cleanupExpiredJWKs(db: Kysely<Database>): Promise<void> {
  const now = Math.floor(Date.now() / 1000)

  await db.deleteFrom('sq_jwks').where('expiresAt', '<=', now).where('isActive', '=', 0).execute()
}
