import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

// User schema with validation rules
export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  username: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  locale: z.string().default('en'),
  isActive: z.number().min(0).max(1).default(1),
  isBanned: z.number().min(0).max(1).default(0),
  banReason: z.string().nullable(),
  bannedUntil: z.number().nullable(),
  lastSignInAt: z.number().nullable(),
  createdAt: z.number(),
  updatedAt: z.number().nullable(),
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
  bannedUntil: ColumnType<number | null>
  lastSignInAt: ColumnType<number | null>
  createdAt: ColumnType<number>
  updatedAt: ColumnType<number | null>
}

// Kysely types for operations
export type UserSelect = Selectable<User>
export type UserInsert = Insertable<User>
export type UserUpdate = Updateable<User>
