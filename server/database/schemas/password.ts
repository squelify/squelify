import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

const passwordAlgorithmEnum = z.enum(['argon2id', 'bcrypt', 'scrypt'])
export type PasswordAlgorithm = z.infer<typeof passwordAlgorithmEnum>

// Password schema with validation rules
export const PasswordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  hash: z.string(),
  algorithm: passwordAlgorithmEnum.default('argon2id'),
  lastChangedAt: z.number().nullable(),
  createdAt: z.number(),
  updatedAt: z.number().nullable(),
})

// Database interface for Kysely
export interface Password {
  id: Generated<string>
  userId: ColumnType<string>
  hash: ColumnType<string>
  algorithm: ColumnType<PasswordAlgorithm>
  lastChangedAt: ColumnType<number | null>
  createdAt: ColumnType<number>
  updatedAt: ColumnType<number | null>
}

// Kysely types for operations
export type PasswordSelect = Selectable<Password>
export type PasswordInsert = Insertable<Password>
export type PasswordUpdate = Updateable<Password>
