import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

// API Key schema with validation rules
export const ApiKeySchema = z.object({
  id: z.custom<Generated<string>>(),
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  key: z.string().min(32, 'API key must be at least 32 characters'),
  hash: z.string().min(1, 'Hash is required'),
  lastUsedAt: z.custom<ColumnType<number | null>>().nullable(),
  expiresAt: z.custom<ColumnType<number | null>>().nullable(),
  isActive: z.number().min(0).max(1).default(1),
  createdAt: z.custom<ColumnType<number>>().optional(),
  updatedAt: z.custom<ColumnType<number | null>>().nullable(),
})

// Table interface for Kysely
export type IApiKey = z.infer<typeof ApiKeySchema>

// Kysely types for operations
export type ApiKey = Selectable<IApiKey>
export type ApiKeyInsert = Insertable<IApiKey>
export type ApiKeyUpdate = Updateable<IApiKey>
