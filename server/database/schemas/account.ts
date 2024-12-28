import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

const accountProviderEnum = z.enum(['local', 'google', 'github', 'apple', 'passkey'])
export type AccountProvider = z.infer<typeof accountProviderEnum>

// Account schema with validation rules
export const AccountSchema = z.object({
  id: z.custom<Generated<string>>(),
  userId: z.string(),
  provider: accountProviderEnum,
  providerAccountId: z.string(),
  providerRefreshToken: z.string().nullable(),
  providerAccessToken: z.string().nullable(),
  providerIdToken: z.string().nullable(),
  providerScope: z.string().nullable(),
  providerTokenType: z.string().nullable(),
  providerExpiresAt: z.custom<ColumnType<number | null>>().nullable(),
  createdAt: z.custom<ColumnType<number>>().optional(),
  updatedAt: z.custom<ColumnType<number | null>>().nullable(),
})

// Table interface for Kysely
export type IAccount = z.infer<typeof AccountSchema>

// Kysely types for operations
export type Account = Selectable<IAccount>
export type AccountInsert = Insertable<IAccount>
export type AccountUpdate = Updateable<IAccount>
