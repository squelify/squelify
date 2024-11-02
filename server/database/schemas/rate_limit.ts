import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

const rateLimitContextEnum = z.enum(['ip', 'user', 'email', 'global'])
export type RateLimitContext = z.infer<typeof rateLimitContextEnum>

// Rate limit schema with validation rules
export const RateLimitSchema = z.object({
  id: z.custom<Generated<string>>(),
  key: z.string(),
  context: rateLimitContextEnum,
  points: z.number().default(0),
  limit: z.number(),
  window: z.number(), // in seconds
  expiresAt: z.custom<ColumnType<number>>(),
  blockedUntil: z.custom<ColumnType<number | null>>().nullable(),
  createdAt: z.custom<ColumnType<number>>().optional(),
  updatedAt: z.custom<ColumnType<number | null>>().nullable(),
})

// Table interface for Kysely
export type IRateLimit = z.infer<typeof RateLimitSchema>

// Kysely types for operations
export type RateLimit = Selectable<IRateLimit>
export type RateLimitInsert = Insertable<IRateLimit>
export type RateLimitUpdate = Updateable<IRateLimit>
