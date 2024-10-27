import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'
import { booleanSchema, timestampSchema } from '~/database/db.helper'

// Email schema with validation rules
export const EmailSchema = z.object({
  id: z.string(),
  userId: z.string(),
  email: z.string().email(),
  isPrimary: booleanSchema.default(0),
  isVerified: booleanSchema.default(0),
  verifiedAt: timestampSchema.nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema.nullable(),
})

// Database interface for Kysely
export interface Email {
  id: Generated<string>
  userId: ColumnType<string>
  email: ColumnType<string>
  isPrimary: ColumnType<number>
  isVerified: ColumnType<number>
  verifiedAt: ColumnType<Date, string | null, never>
  createdAt: ColumnType<Date, string | undefined, never>
  updatedAt: ColumnType<Date, string | undefined, never>
}

// Kysely types for operations
export type EmailSelect = Selectable<Email>
export type EmailInsert = Insertable<Email>
export type EmailUpdate = Updateable<Email>
