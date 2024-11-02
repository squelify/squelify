import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

// User schema with validation rules
export const UserSchema = z.object({
  id: z.custom<Generated<string>>(),
  firstName: z.string().min(2, 'Nama depan minimal 2 karakter'),
  lastName: z.string().nullable(),
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(50, 'Username maksimal 50 karakter')
    .regex(/^[a-z0-9_]+$/, 'Username hanya boleh mengandung huruf kecil, angka, dan underscore')
    .nullable(),
  avatarUrl: z.string().url('URL avatar tidak valid').nullable(),
  locale: z.string().default('en'),
  isActive: z.number().min(0).max(1).default(1),
  isBanned: z.number().min(0).max(1).default(0),
  banReason: z.string().nullable(),
  bannedUntil: z.custom<ColumnType<number | null>>().nullable(),
  lastSignInAt: z.custom<ColumnType<number | null>>().nullable(),
  createdAt: z.custom<ColumnType<number>>().optional(),
  updatedAt: z.custom<ColumnType<number | null>>().nullable(),
})

// Table interface for Kysely
export type IUser = z.infer<typeof UserSchema>

// Kysely types for operations
export type User = Selectable<IUser>
export type UserInsert = Insertable<IUser>
export type UserUpdate = Updateable<IUser>
