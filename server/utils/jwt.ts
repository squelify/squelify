import * as jose from 'jose'
import type { JWTHeaderParameters } from 'jose'
import { env } from 'std-env'
import type { JWK, JWKVerifyKey } from '~/database/schemas/jwk'
import { DURATION } from '~/utils/datetime'

export const TOKEN_DURATION = {
  accessToken: DURATION.MINUTE * 15, // 15 menit
  refreshToken: DURATION.WEEK, // 7 hari
  verificationToken: DURATION.DAY, // 24 jam
  jwk: DURATION.MONTH, // 30 hari
}

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
  key: Partial<JWK>,
  opts: {
    issuer: string
    audience: string | string[]
  }
) {
  try {
    if (!key.privateKey || !key.algorithm || !key.keyId) {
      throw new Error('Invalid JWK configuration')
    }

    const privateKey = await jose.importPKCS8(key.privateKey, key.algorithm)

    const headerParams: JWTHeaderParameters = {
      alg: key.algorithm,
      kid: key.keyId,
      typ: 'JWT',
    }

    return await new jose.SignJWT({
      ...payload,
      iss: opts.issuer,
      aud: opts.audience,
      exp: payload.exp,
      nbf: payload.nbf,
      iat: payload.iat,
    })
      .setProtectedHeader(headerParams)
      .sign(privateKey)
  } catch (error) {
    logger.error('[jwt]', 'Token generation failed', {
      error: error.message,
      keyId: key.keyId,
      algorithm: key.algorithm,
    })
    throw new JWTGenerationError('Token generation failed')
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
    if (env.SQUELIFY_LOG_LEVEL === 'trace') {
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
