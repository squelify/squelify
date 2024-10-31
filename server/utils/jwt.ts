import * as jose from 'jose'
import type { JWTHeaderParameters } from 'jose'
import { env } from 'std-env'
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

const TOKEN_MAX_AGE = '15m' // 15 minutes

export async function generateAccessToken(
  payload: JWTPayload,
  key: Partial<JWKSelect>,
  opts: {
    issuer: string
    audience: string | string[]
  }
) {
  try {
    if (!key.privateKey || !key.algorithm || !key.keyId) {
      throw new Error('Invalid JWK configuration: missing required fields')
    }

    const privateKey = await jose.importPKCS8(key.privateKey, key.algorithm).catch((err) => {
      throw new Error(`Failed to import private key: ${err.message}`)
    })

    const now = Math.floor(Date.now() / 1000)
    const jwtPayload = { ...payload, type: 'access_token', iat: now }
    const headerParams: JWTHeaderParameters = {
      alg: key.algorithm,
      kid: key.keyId,
      typ: 'JWT',
    }

    const token = await new jose.SignJWT(jwtPayload)
      .setProtectedHeader(headerParams)
      .setIssuedAt()
      .setIssuer(opts.issuer)
      .setAudience(opts.audience)
      .setExpirationTime(TOKEN_MAX_AGE)
      .setNotBefore(0)
      .sign(privateKey)
      .catch((err) => {
        throw new Error(`Failed to sign JWT: ${err.message}`)
      })

    return token
  } catch (error) {
    if (env.APP_LOG_LEVEL === 'trace') {
      logger.error('[jwt]', 'Failed to generate access token:', error)
    }
    throw new JWTGenerationError('Failed to generate access token', { cause: error })
  }
}

export class JWTGenerationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'JWTGenerationError'
  }
}

export async function verifyAccessToken(
  token: string,
  key: JWKVerifyKey,
  opts: {
    issuer: string
    audience: string | string[]
  }
): Promise<JWTPayload | null> {
  try {
    if (!key.publicKey || !key.algorithm) {
      throw new Error('Invalid JWK configuration: missing required fields')
    }

    const publicKey = await jose.importSPKI(key.publicKey, key.algorithm).catch((err) => {
      throw new Error(`Failed to import public key: ${err.message}`)
    })

    const { payload } = await jose
      .jwtVerify(token, publicKey, {
        algorithms: [key.algorithm],
        issuer: opts.issuer,
        audience: opts.audience,
        clockTolerance: 30,
        maxTokenAge: TOKEN_MAX_AGE,
        requiredClaims: ['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti', 'sid'],
        typ: 'JWT',
      })
      .catch((err) => {
        throw new JWTVerificationError(`JWT verification failed: ${err.message}`)
      })

    // Validate required custom claims
    const requiredClaims = ['sid', 'given_name', 'email', 'locale']
    const missingClaims = requiredClaims.filter((claim) => !payload[claim])

    if (missingClaims.length > 0) {
      throw new JWTVerificationError(`Missing required claims: ${missingClaims.join(', ')}`)
    }

    return payload as unknown as JWTPayload
  } catch (error) {
    if (env.APP_LOG_LEVEL === 'trace') {
      logger.error('[jwt]', 'Token verification failed:', {
        error,
        token: `${token.substring(0, 10)}...`,
      })
    }
    return null
  }
}

export class JWTVerificationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'JWTVerificationError'
  }
}
