import type { Insertable, Selectable, Updateable } from 'kysely'
import { z } from 'zod'
import { columnType, generatedType } from '~/database/db.helper'

export const UserSchema = z.object({
  id: generatedType<string>(),
  email: z.string(),
  username: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string().nullable().default(null),
  role: z.enum(['admin', 'user']).default('user'),
  isAnonymous: z.boolean().nullable().default(null),
  emailVerified: z.boolean().default(false),
  diggestSubscribed: z.boolean().default(false),
  phoneNumber: z.string().nullable().default(null),
  phoneNumberVerified: z.boolean().nullable().default(null),
  twoFactorEnabled: z.boolean().nullable().default(null),
  image: z.string().nullable().default(null),
  banned: z.boolean().nullable().default(null),
  banReason: z.string().nullable().default(null),
  banExpires: z.number().nullable().default(null),
  createdAt: columnType<Date>(),
  updatedAt: columnType<Date>(),
})

/**
 * If the column is nullable in the database, make its type nullable.
 * Don't use optional properties. Optionality is always determined
 * automatically by Kysely.
 */
export type UserTable = z.infer<typeof UserSchema>

export type User = Selectable<UserTable>
export type UserInsert = Insertable<UserTable>
export type UserUpdate = Updateable<UserTable>
