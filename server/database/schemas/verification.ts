import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'
import { timestampSchema } from '~/database/db.helper'

const verificationTypeEnum = z.enum(['email', 'phone', 'password_reset', 'magic_link'])
export type VerificationType = z.infer<typeof verificationTypeEnum>

// Verification schema with validation rules
export const VerificationSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  type: verificationTypeEnum,
  identifier: z.string(),
  token: z.string(),
  attempts: z.number().default(0),
  maxAttempts: z.number().default(3),
  expiresAt: timestampSchema,
  verifiedAt: timestampSchema.nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema.nullable(),
})

// Database interface for Kysely
export interface Verification {
  id: Generated<string>
  userId: ColumnType<string | null>
  type: ColumnType<VerificationType>
  identifier: ColumnType<string>
  token: ColumnType<string>
  attempts: ColumnType<number>
  maxAttempts: ColumnType<number>
  expiresAt: ColumnType<Date, string, never>
  verifiedAt: ColumnType<Date, string | null, never>
  createdAt: ColumnType<Date, string | undefined, never>
  updatedAt: ColumnType<Date, string | undefined, never>
}

// Kysely types for operations
export type VerificationSelect = Selectable<Verification>
export type VerificationInsert = Insertable<Verification>
export type VerificationUpdate = Updateable<Verification>
