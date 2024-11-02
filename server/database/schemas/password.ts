import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

const passwordAlgorithmEnum = z.enum(['argon2id', 'bcrypt', 'scrypt'])
export type PasswordAlgorithm = z.infer<typeof passwordAlgorithmEnum>

// Password schema with validation rules
export const PasswordSchema = z.object({
  id: z.custom<Generated<string>>(),
  userId: z.string(),
  hash: z.string(),
  algorithm: passwordAlgorithmEnum.default('scrypt'),
  lastChangedAt: z.custom<ColumnType<number | null>>().nullable(),
  createdAt: z.custom<ColumnType<number>>().optional(),
  updatedAt: z.custom<ColumnType<number | null>>().nullable(),
})

// Table interface for Kysely
export type IPassword = z.infer<typeof PasswordSchema>

// Kysely types for operations
export type Password = Selectable<IPassword>
export type PasswordInsert = Insertable<IPassword>
export type PasswordUpdate = Updateable<IPassword>
