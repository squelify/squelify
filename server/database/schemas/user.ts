import type { Insertable, Selectable, Updateable } from 'kysely'
import { z } from 'zod'
import { columnType, generatedType } from '~/database/db.helper'

export const UserSchema = z.object({
  id: generatedType<string>(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string().nullable().default(null),
  username: z.string().nullable(),
  phoneNumber: z.string().nullable().default(null),
  avatarUrl: z.string().nullable().default(null),
  twoFactorEnabled: z.boolean().nullable().default(null),
  isAnonymous: z.boolean().nullable().default(null),
  isBanned: z.boolean().nullable().default(null),
  banReason: z.string().nullable().default(null),
  bannedUntil: columnType<Date>().nullable().default(null),
  emailVerifiedAt: columnType<Date>().nullable().default(null),
  phoneVerifiedAt: columnType<Date>().nullable().default(null),
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
