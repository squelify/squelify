import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

const twoFactorTypeEnum = z.enum(['totp', 'email', 'sms'])
export type TwoFactorType = z.infer<typeof twoFactorTypeEnum>

// Two factor schema with validation rules
export const TwoFactorSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1),
  type: twoFactorTypeEnum,
  secret: z.string(),
  backupCodes: z.string().default('[]'),
  lastUsedAt: z.number().nullable(),
  isVerified: z.number().min(0).max(1).default(0),
  isPrimary: z.number().min(0).max(1).default(0),
  verifiedAt: z.number().nullable(),
  createdAt: z.number(),
  updatedAt: z.number().nullable(),
})

// Database interface for Kysely
export interface ITwoFactor {
  id: Generated<string>
  userId: ColumnType<string>
  name: ColumnType<string>
  type: ColumnType<TwoFactorType>
  secret: ColumnType<string>
  backupCodes: ColumnType<string>
  lastUsedAt: ColumnType<number | null>
  isVerified: ColumnType<number>
  isPrimary: ColumnType<number>
  verifiedAt: ColumnType<number | null>
  createdAt: ColumnType<number>
  updatedAt: ColumnType<number | null>
}

// Kysely types for operations
export type TwoFactor = Selectable<ITwoFactor>
export type TwoFactorInsert = Insertable<ITwoFactor>
export type TwoFactorUpdate = Updateable<ITwoFactor>
