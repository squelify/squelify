import * as jose from 'jose'
import { type Kysely } from 'kysely'
import { typeid } from 'typeid-js'
import type { Database } from '~/database/db.schema'
import type { JWKInsert } from '~/database/schemas/jwk'

export default async function seed(db: Kysely<Database>): Promise<void> {
  const now = new Date()

  // Generate RSA key pair
  const { publicKey, privateKey } = await jose.generateKeyPair('RS256')
  const publicKeyString = await jose.exportSPKI(publicKey)
  const privateKeyString = await jose.exportPKCS8(privateKey)

  const jwk: JWKInsert = {
    id: typeid('jwk').toString(),
    keyId: typeid('kid').toString(),
    publicKey: publicKeyString,
    privateKey: privateKeyString,
    algorithm: 'RS256',
    isActive: 1,
    expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    createdAt: now.toISOString(),
  }

  await db.insertInto('jwks').values(jwk).execute()
}
