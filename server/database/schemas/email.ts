import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

// Email schema with validation rules
export const EmailSchema = z.object({
  id: z.string(),
  userId: z.string(),
  email: z.string().email(),
  isPrimary: z.number().min(0).max(1).default(0),
  isVerified: z.number().min(0).max(1).default(0),
  verifiedAt: z.number().nullable(),
  createdAt: z.number(),
  updatedAt: z.number().nullable(),
})

// Database interface for Kysely
export interface IEmail {
  id: Generated<string>
  userId: ColumnType<string>
  email: ColumnType<string>
  isPrimary: ColumnType<number>
  isVerified: ColumnType<number>
  verifiedAt: ColumnType<number | null>
  createdAt: ColumnType<number>
  updatedAt: ColumnType<number | null>
}

// Kysely types for operations
export type Email = Selectable<IEmail>
export type EmailInsert = Insertable<IEmail>
export type EmailUpdate = Updateable<IEmail>
