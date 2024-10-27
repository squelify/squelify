import type { Insertable, Selectable, Updateable } from 'kysely'
import { z } from 'zod'
import { columnType, generatedType } from '~/database/db.helper'

export const AccountSchema = z.object({
  id: generatedType<string>(),
  userId: z.string(),
  providerId: z.string(),
  accountId: z.string(),
  accessToken: z.string().nullable().default(null),
  refreshToken: z.string().nullable().default(null),
  idToken: z.string().nullable().default(null),
  password: z.string().nullable().default(null),
  tokenExpiresAt: columnType<Date>().nullable().default(null),
  createdAt: columnType<Date>(),
  updatedAt: columnType<Date>(),
})

/**
 * If the column is nullable in the database, make its type nullable.
 * Don't use optional properties. Optionality is always determined
 * automatically by Kysely.
 */
export type AccountTable = z.infer<typeof AccountSchema>

export type Account = Selectable<AccountTable>
export type AccountInsert = Insertable<AccountTable>
export type AccountUpdate = Updateable<AccountTable>
