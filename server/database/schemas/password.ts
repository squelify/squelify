import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'
import { timestampSchema } from '~/database/db.helper'

const passwordAlgorithmEnum = z.enum(['argon2id', 'bcrypt', 'scrypt'])
export type PasswordAlgorithm = z.infer<typeof passwordAlgorithmEnum>

// Password schema with validation rules
export const PasswordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  hash: z.string(),
  algorithm: passwordAlgorithmEnum.default('argon2id'),
  resetToken: z.string().nullable(),
  resetTokenExpiresAt: timestampSchema.nullable(),
  lastChangedAt: timestampSchema.nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema.nullable(),
})

// Database interface for Kysely
export interface Password {
  id: Generated<string>
  userId: ColumnType<string>
  hash: ColumnType<string>
  algorithm: ColumnType<PasswordAlgorithm>
  resetToken: ColumnType<string | null>
  resetTokenExpiresAt: ColumnType<Date, string | null, never>
  lastChangedAt: ColumnType<Date, string | null, never>
  createdAt: ColumnType<Date, string | undefined, never>
  updatedAt: ColumnType<Date, string | undefined, never>
}

// Kysely types for operations
export type PasswordSelect = Selectable<Password>
export type PasswordInsert = Insertable<Password>
export type PasswordUpdate = Updateable<Password>
