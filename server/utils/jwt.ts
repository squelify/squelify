import * as jose from 'jose'
import { env } from 'std-env'

// Example usage:
// const payload = { userId: '123', email: 'user@example.com' }
// const accessToken = await generateAccessToken(payload)
// const refreshToken = await generateRefreshToken(payload)
// const decoded = await decodeJWT(accessToken)

export async function generateAccessToken(
  payload: Record<string, any>,
  expiresIn: number | string | Date = '1h'
) {
  const secret = new TextEncoder().encode(env.JWT_SECRET_KEY)
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret)
}

export async function generateRefreshToken(
  payload: Record<string, any>,
  expiresIn: number | string | Date = '7d'
) {
  const secret = new TextEncoder().encode(env.JWT_SECRET_KEY)
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret)
}

export async function decodeJWT<T extends jose.JWTPayload>(token: string): Promise<T | null> {
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET_KEY)
    const { payload } = await jose.jwtVerify(token, secret)
    return payload as T
  } catch (_error) {
    return null
  }
}
