import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

/**
 * Supported JWT signing algorithms
 *
 * RSA family:
 * - RS256: RSA with SHA-256 (widely supported, good compatibility)
 * - RS384: RSA with SHA-384 (stronger security)
 * - RS512: RSA with SHA-512 (highest security in RSA family)
 * - PS256: RSA-PSS with SHA-256 (more modern RSA variant)
 * - PS384: RSA-PSS with SHA-384
 * - PS512: RSA-PSS with SHA-512
 *
 * ECDSA family:
 * - ES256: ECDSA with P-256 curve (recommended, great performance/security balance)
 * - ES384: ECDSA with P-384 curve (stronger security)
 * - ES512: ECDSA with P-521 curve (highest security in ECDSA family)
 *
 * Modern:
 * - EdDSA: Ed25519 (best performance, modern security)
 */
const jwkAlgorithmEnum = z.enum([
  'RS256',
  'RS384',
  'RS512',
  'PS256',
  'PS384',
  'PS512',
  'ES256',
  'ES384',
  'ES512',
  'EdDSA',
])
export type JWKAlgorithm = z.infer<typeof jwkAlgorithmEnum>

// JWK schema with validation rules
export const JWKSchema = z.object({
  id: z.string(),
  keyId: z.string(),
  publicKey: z.string(),
  privateKey: z.string(),
  algorithm: jwkAlgorithmEnum.default('ES256'),
  isActive: z.number().min(0).max(1).default(1),
  expiresAt: z.number(),
  createdAt: z.number(),
  updatedAt: z.number().nullable(),
})

// Database interface for Kysely
export interface JWK {
  id: Generated<string>
  keyId: ColumnType<string>
  publicKey: ColumnType<string>
  privateKey: ColumnType<string>
  algorithm: ColumnType<JWKAlgorithm>
  isActive: ColumnType<number>
  expiresAt: ColumnType<number>
  createdAt: ColumnType<number>
  updatedAt: ColumnType<number | null>
}

// Kysely types for operations
export type JWKSelect = Selectable<JWK>
export type JWKInsert = Insertable<JWK>
export type JWKUpdate = Updateable<JWK>

// Type for JWT verification that only requires necessary fields
export type JWKVerifyKey = Pick<JWKSelect, 'keyId' | 'publicKey' | 'algorithm'>
