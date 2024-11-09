import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'
import { DURATION } from '~/utils/datetime'

export const passwordAlgorithmEnum = z.enum(['argon2id', 'bcrypt', 'scrypt'])
export type PasswordAlgorithm = z.infer<typeof passwordAlgorithmEnum>
export const DEFAULT_PASSWORD_ALGORITHM: PasswordAlgorithm = 'scrypt'

// Password schema with validation rules
export const PasswordSchema = z.object({
  id: z.custom<Generated<string>>(),
  userId: z.string(),
  hash: z.string(),
  algorithm: passwordAlgorithmEnum.default(DEFAULT_PASSWORD_ALGORITHM),
  previousHashes: z.string().default('[]'),
  resetRequired: z.number().min(0).max(1).default(0),
  failedAttempts: z.number().min(0).default(0),
  lastAttemptAt: z.custom<ColumnType<number>>().optional(),
  lastChangedAt: z.custom<ColumnType<number>>().optional(),
  expiresAt: z.custom<ColumnType<number>>().optional(),
  lockedUntil: z.custom<ColumnType<number>>().optional(),
  createdAt: z.custom<ColumnType<number>>().optional(),
  updatedAt: z.custom<ColumnType<number | null>>().nullable(),
})

// Table interface for Kysely
export type IPassword = z.infer<typeof PasswordSchema>

// Kysely types for operations
export type Password = Selectable<IPassword>
export type PasswordInsert = Insertable<IPassword>
export type PasswordUpdate = Updateable<IPassword>

// Constants for password policies
export const PASSWORD_POLICIES = {
  MAX_ATTEMPTS: 5,
  LOCKOUT_DURATION: DURATION.MINUTE * 15, // 15 minutes in seconds
  EXPIRY_DURATION: DURATION.DAY * 90, // 90 days in seconds
  MIN_LENGTH: 8,
  REQUIRE_LOWERCASE: true,
  REQUIRE_UPPERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
  PREVENT_REUSE: 5, // Number of previous passwords to check
} as const
