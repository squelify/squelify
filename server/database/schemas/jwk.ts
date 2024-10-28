import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'
import { booleanSchema, timestampSchema } from '~/database/db.helper'

const jwkAlgorithmEnum = z.enum(['RS256', 'ES256'])
export type JWKAlgorithm = z.infer<typeof jwkAlgorithmEnum>

// JWK schema with validation rules
export const JWKSchema = z.object({
  id: z.string(),
  keyId: z.string(),
  publicKey: z.string(),
  privateKey: z.string(),
  algorithm: jwkAlgorithmEnum.default('RS256'),
  isActive: booleanSchema.default(1),
  expiresAt: timestampSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema.nullable(),
})

// Database interface for Kysely
export interface JWK {
  id: Generated<string>
  keyId: ColumnType<string>
  publicKey: ColumnType<string>
  privateKey: ColumnType<string>
  algorithm: ColumnType<JWKAlgorithm>
  isActive: ColumnType<number>
  expiresAt: ColumnType<Date, string, never>
  createdAt: ColumnType<Date, string | undefined, never>
  updatedAt: ColumnType<Date, string | undefined, never>
}

// Kysely types for operations
export type JWKSelect = Selectable<JWK>
export type JWKInsert = Insertable<JWK>
export type JWKUpdate = Updateable<JWK>
