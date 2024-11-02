import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

const twoFactorTypeEnum = z.enum(['totp', 'email', 'sms'])
export type TwoFactorType = z.infer<typeof twoFactorTypeEnum>

// Two factor schema with validation rules
export const TwoFactorSchema = z.object({
  id: z.custom<Generated<string>>(),
  userId: z.string(),
  name: z.string().min(1),
  type: twoFactorTypeEnum,
  secret: z.string(),
  backupCodes: z.string().default('[]'),
  lastUsedAt: z.custom<ColumnType<number | null>>().nullable(),
  isVerified: z.number().min(0).max(1).default(0),
  isPrimary: z.number().min(0).max(1).default(0),
  verifiedAt: z.custom<ColumnType<number | null>>().nullable(),
  createdAt: z.custom<ColumnType<number>>().optional(),
  updatedAt: z.custom<ColumnType<number | null>>().nullable(),
})

// Table interface for Kysely
export type ITwoFactor = z.infer<typeof TwoFactorSchema>

// Kysely types for operations
export type TwoFactor = Selectable<ITwoFactor>
export type TwoFactorInsert = Insertable<ITwoFactor>
export type TwoFactorUpdate = Updateable<ITwoFactor>
