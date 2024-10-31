import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

const verificationTypeEnum = z.enum(['email', 'phone', 'password_reset', 'magic_link', 'otp'])
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
  metadata: z.string().default('{}'),
  expiresAt: z.number(),
  verifiedAt: z.number().nullable(),
  createdAt: z.number(),
  updatedAt: z.number().nullable(),
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
  metadata: ColumnType<string>
  expiresAt: ColumnType<number>
  verifiedAt: ColumnType<number | null>
  createdAt: ColumnType<number>
  updatedAt: ColumnType<number | null>
}

// Kysely types for operations
export type VerificationSelect = Selectable<Verification>
export type VerificationInsert = Insertable<Verification>
export type VerificationUpdate = Updateable<Verification>
