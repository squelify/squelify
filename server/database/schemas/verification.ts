import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

const verificationTypeEnum = z.enum(['email', 'phone', 'password_reset', 'magic_link', 'otp'])
export type VerificationType = z.infer<typeof verificationTypeEnum>

// Verification schema with validation rules
export const VerificationSchema = z.object({
  id: z.custom<Generated<string>>(),
  userId: z.string().nullable(),
  type: verificationTypeEnum,
  identifier: z.string(),
  token: z.string(),
  attempts: z.number().default(0),
  maxAttempts: z.number().default(3),
  metadata: z.string().default('{}'),
  expiresAt: z.custom<ColumnType<number>>(),
  verifiedAt: z.custom<ColumnType<number | null>>().nullable(),
  createdAt: z.custom<ColumnType<number>>().optional(),
  updatedAt: z.custom<ColumnType<number | null>>().nullable(),
})

// Table interface for Kysely
export type IVerification = z.infer<typeof VerificationSchema>

// Kysely types for operations
export type Verification = Selectable<IVerification>
export type VerificationInsert = Insertable<IVerification>
export type VerificationUpdate = Updateable<IVerification>
