import * as jose from 'jose'
import { type Kysely } from 'kysely'
import { typeid } from 'typeid-js'
import type { Database } from '~/database/db.schema'
import type { JWKInsert } from '~/database/schemas/jwk'

export default async function seed(db: Kysely<Database>): Promise<void> {
  const now = Math.floor(Date.now() / 1000)

  // Generate EC key pair using P-256 curve
  const { publicKey, privateKey } = await jose.generateKeyPair('ES256')
  const publicKeyString = await jose.exportSPKI(publicKey)
  const privateKeyString = await jose.exportPKCS8(privateKey)

  const jwk: JWKInsert = {
    id: typeid('jwk').toString(),
    keyId: typeid('kid').toString(),
    publicKey: publicKeyString,
    privateKey: privateKeyString,
    algorithm: 'ES256',
    isActive: 1,
    expiresAt: now + 30 * 24 * 60 * 60 /* 3o days */,
    createdAt: now,
  }

  await db.insertInto('jwks').values(jwk).execute()
}
