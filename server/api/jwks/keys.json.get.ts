import * as jose from 'jose'
import { JWKAlgorithm } from '~/database/schemas/jwk'

export interface IJWKSResponse {
  keys: Array<{
    kid: string
    kty: string
    alg: JWKAlgorithm
    use: string
    n?: string
    e?: string
    crv?: string
    x?: string
    y?: string
  }>
}

export default defineCachedEventHandler(
  async (event) => {
    const db = event.context.db

    try {
      const keys = await db
        .selectFrom('sq_jwks')
        .where('isActive', '=', 1)
        .where('expiresAt', '>', Math.floor(Date.now() / 1000))
        .select(['keyId', 'publicKey', 'algorithm'])
        .execute()

      const jwksData = await Promise.all(
        keys.map(async (key) => {
          const publicKey = await jose.importSPKI(key.publicKey, key.algorithm)
          const jwk = await jose.exportJWK(publicKey)

          const baseJWK = {
            kid: key.keyId,
            kty: jwk.kty,
            alg: key.algorithm as JWKAlgorithm,
            use: 'sig',
          }

          // RSA family algorithms
          if (['RS256', 'RS384', 'RS512', 'PS256', 'PS384', 'PS512'].includes(key.algorithm)) {
            return {
              ...baseJWK,
              n: jwk.n,
              e: jwk.e,
            }
          }

          // ECDSA family algorithms
          if (['ES256', 'ES384', 'ES512'].includes(key.algorithm)) {
            return {
              ...baseJWK,
              crv: jwk.crv,
              x: jwk.x,
              y: jwk.y,
            }
          }

          // EdDSA
          if (key.algorithm === 'EdDSA') {
            return {
              ...baseJWK,
              crv: jwk.crv,
              x: jwk.x,
            }
          }

          return baseJWK
        })
      )

      setResponseHeaders(event, {
        'Cache-Control': 'public, max-age=3600',
        'Content-Type': 'application/json',
      })

      return { keys: jwksData }
    } catch (error) {
      return throwErrorResponse(event, error)
    }
  },
  {
    shouldBypassCache: (e) => handleBypassCache(e),
    maxAge: DURATION.MONTH,
  }
)

defineRouteMeta({
  openAPI: {
    summary: 'JWKS Endpoint',
    tags: ['General'],
  },
})
