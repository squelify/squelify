import * as jose from 'jose'
import type { JWKSelect, JWKVerifyKey } from '~/database/schemas/jwk'

export interface JWTPayload {
  // Standard JWT Claims
  iss: string // Issuer: auth service identifier
  sub: string // Subject: user ID
  aud: string[] // Audience: array of intended recipients
  exp: number // Expiration timestamp
  nbf: number // Not before timestamp
  iat: number // Issued at timestamp
  jti: string // JWT ID: unique token identifier
  sid: string // Session ID from sessions table

  // OpenID Connect Claims
  name?: string // Full formatted name
  given_name: string // First name
  family_name?: string // Last name
  email: string // Primary email
  locale: string // User locale preference

  // Security Claims
  azp?: string // Authorized party - client ID
  scope?: string // Token scope
  amr?: string[] // Authentication methods references

  // Custom Claims
  org_id?: string // Active organization context
  roles?: string[] // User roles
  perms?: string[] // User permissions
}

export async function generateAccessToken(
  payload: JWTPayload,
  key: Partial<JWKSelect>,
  expiresIn = '15m'
) {
  const privateKey = await jose.importPKCS8(key.privateKey, key.algorithm)

  return await new jose.SignJWT({
    ...payload,
    type: 'access_token',
    iat: Math.floor(Date.now() / 1000),
  })
    .setProtectedHeader({
      alg: key.algorithm,
      kid: key.keyId,
      typ: 'JWT',
    })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setNotBefore(0)
    .setAudience('api://default')
    .setIssuer('auth-service')
    .sign(privateKey)
}

export async function verifyAccessToken(
  token: string,
  key: JWKVerifyKey
): Promise<JWTPayload | null> {
  try {
    const publicKey = await jose.importSPKI(key.publicKey, key.algorithm)

    const { payload } = await jose.jwtVerify(token, publicKey, {
      algorithms: [key.algorithm],
      issuer: 'auth-service',
      audience: ['api://default'],
      clockTolerance: 30,
      maxTokenAge: '15m',
      requiredClaims: ['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti', 'sid'],
      typ: 'JWT',
    })

    // Validate required custom claims
    if (!payload.sid || !payload.given_name || !payload.email || !payload.locale) {
      return null
    }

    return payload as unknown as JWTPayload
  } catch (error) {
    logger.error('[jwt]', 'Token verification failed:', error)
    return null
  }
}
