import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'
import { timestampSchema } from '~/database/db.helper'

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
  providerExpiresAt: timestampSchema.nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema.nullable(),
})

// Database interface for Kysely
export interface Account {
  id: Generated<string>
  userId: ColumnType<string>
  provider: ColumnType<AccountProvider>
  providerAccountId: ColumnType<string>
  providerRefreshToken: ColumnType<string | null>
  providerAccessToken: ColumnType<string | null>
  providerIdToken: ColumnType<string | null>
  providerScope: ColumnType<string | null>
  providerTokenType: ColumnType<string | null>
  providerExpiresAt: ColumnType<Date, string | null, never>
  createdAt: ColumnType<Date, string | undefined, never>
  updatedAt: ColumnType<Date, string | undefined, never>
}

// Kysely types for operations
export type AccountSelect = Selectable<Account>
export type AccountInsert = Insertable<Account>
export type AccountUpdate = Updateable<Account>
