import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'
import { booleanSchema, timestampSchema } from '~/database/db.helper'

// User schema with validation rules
export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  username: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  locale: z.string().default('en'),
  isActive: booleanSchema.default(1),
  isBanned: booleanSchema.default(0),
  banReason: z.string().nullable(),
  bannedUntil: timestampSchema.nullable(),
  lastSignInAt: timestampSchema.nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema.nullable(),
})

// Database interface for Kysely
export interface User {
  id: Generated<string>
  firstName: ColumnType<string>
  lastName: ColumnType<string | null>
  username: ColumnType<string | null>
  avatarUrl: ColumnType<string | null>
  locale: ColumnType<string>
  isActive: ColumnType<number>
  isBanned: ColumnType<number>
  banReason: ColumnType<string | null>
  bannedUntil: ColumnType<Date, string | null, never>
  lastSignInAt: ColumnType<Date, string | null, never>
  createdAt: ColumnType<Date, string | undefined, never>
  updatedAt: ColumnType<Date, string | undefined, never>
}

// Kysely types for operations
export type UserSelect = Selectable<User>
export type UserInsert = Insertable<User>
export type UserUpdate = Updateable<User>
