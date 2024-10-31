import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

const accountProviderEnum = z.enum(['local', 'google', 'github', 'apple', 'passkey'])
export type AccountProvider = z.infer<typeof accountProviderEnum>

// Account schema with validation rules
export const AccountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  provider: accountProviderEnum,
  providerAccountId: z.string(),
  providerRefreshToken: z.string().nullable(),
  providerAccessToken: z.string().nullable(),
  providerIdToken: z.string().nullable(),
  providerScope: z.string().nullable(),
  providerTokenType: z.string().nullable(),
  providerExpiresAt: z.number().nullable(),
  createdAt: z.number(),
  updatedAt: z.number().nullable(),
})

// Database interface for Kysely
export interface IAccount {
  id: Generated<string>
  userId: ColumnType<string>
  provider: ColumnType<AccountProvider>
  providerAccountId: ColumnType<string>
  providerRefreshToken: ColumnType<string | null>
  providerAccessToken: ColumnType<string | null>
  providerIdToken: ColumnType<string | null>
  providerScope: ColumnType<string | null>
  providerTokenType: ColumnType<string | null>
  providerExpiresAt: ColumnType<number | null>
  createdAt: ColumnType<number>
  updatedAt: ColumnType<number | null>
}

// Kysely types for operations
export type Account = Selectable<IAccount>
export type AccountInsert = Insertable<IAccount>
export type AccountUpdate = Updateable<IAccount>
