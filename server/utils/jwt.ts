import * as jose from 'jose'
import type { JWKSelect } from '~/database/schemas/jwk'

export async function generateAccessToken(
  payload: Record<string, any>,
  key: JWKSelect,
  expiresIn = '1h'
) {
  const privateKey = await jose.importPKCS8(key.privateKey, key.algorithm)

  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: key.algorithm, kid: key.keyId })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(privateKey)
}

export async function verifyAccessToken<T extends jose.JWTPayload>(
  token: string,
  key: JWKSelect
): Promise<T | null> {
  try {
    const publicKey = await jose.importSPKI(key.publicKey, key.algorithm)
    const { payload } = await jose.jwtVerify(token, publicKey)
    return payload as T
  } catch (_error) {
    return null
  }
}
