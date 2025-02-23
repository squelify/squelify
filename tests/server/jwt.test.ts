import * as jose from 'jose'
import { describe, expect, it } from 'vitest'
import type { JWK, JWKVerifyKey } from '~/database/schemas/jwk'
import {
  type JWTPayload,
  TOKEN_DURATION,
  generateAccessToken,
  verifyAccessToken,
} from '~/utils/jwt'

describe('JWT Utils', () => {
  const mockJWTPayload: JWTPayload = {
    iss: 'https://auth.example.com',
    sub: 'user123',
    aud: ['webapp'],
    exp: Math.floor(Date.now() / 1000) + TOKEN_DURATION.accessToken,
    nbf: Math.floor(Date.now() / 1000),
    iat: Math.floor(Date.now() / 1000),
    jti: 'token123',
    sid: 'session123',
    given_name: 'John',
    email: 'john@example.com',
    locale: 'en-US',
  }

  const mockOptions = {
    issuer: 'https://auth.example.com',
    audience: 'webapp',
  }

  it('should generate and verify access token successfully', async () => {
    // Generate test key pair using ES256 (same as seeder)
    const keyPair = await jose.generateKeyPair('ES256')
    const privateKeyPem = await jose.exportPKCS8(keyPair.privateKey)
    const publicKeyPem = await jose.exportSPKI(keyPair.publicKey)

    const mockJWK: Partial<JWK> = {
      privateKey: privateKeyPem,
      publicKey: publicKeyPem,
      algorithm: 'ES256',
      keyId: 'test-key-1',
    }

    const token = await generateAccessToken(mockJWTPayload, mockJWK, mockOptions)
    expect(token).toBeDefined()
    expect(typeof token).toBe('string')

    const verifyKey: JWKVerifyKey = {
      publicKey: publicKeyPem,
      algorithm: 'ES256',
      keyId: 'test-key-1',
    }

    const verifiedPayload = await verifyAccessToken(token, verifyKey, mockOptions)

    expect(verifiedPayload).toBeDefined()
    expect(verifiedPayload?.sub).toBe(mockJWTPayload.sub)
    expect(verifiedPayload?.email).toBe(mockJWTPayload.email)
  })

  it('should fail verification with invalid token', async () => {
    const keyPair = await jose.generateKeyPair('ES256')
    const publicKeyPem = await jose.exportSPKI(keyPair.publicKey)

    const invalidToken = 'invalid.token.here'

    const verifyKey: JWKVerifyKey = {
      publicKey: publicKeyPem,
      algorithm: 'ES256',
      keyId: 'test-key-1',
    }

    const result = await verifyAccessToken(invalidToken, verifyKey, mockOptions)

    expect(result).toBeNull()
  })

  it('should fail verification with expired token', async () => {
    const keyPair = await jose.generateKeyPair('ES256')
    const privateKeyPem = await jose.exportPKCS8(keyPair.privateKey)
    const publicKeyPem = await jose.exportSPKI(keyPair.publicKey)

    const expiredPayload = {
      ...mockJWTPayload,
      exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
    }

    const mockJWK: Partial<JWK> = {
      privateKey: privateKeyPem,
      publicKey: publicKeyPem,
      algorithm: 'ES256',
      keyId: 'test-key-1',
    }

    const token = await generateAccessToken(expiredPayload, mockJWK, mockOptions)

    const verifyKey: JWKVerifyKey = {
      publicKey: publicKeyPem,
      algorithm: 'ES256',
      keyId: 'test-key-1',
    }

    const result = await verifyAccessToken(token, verifyKey, mockOptions)

    expect(result).toBeNull()
  })
})
