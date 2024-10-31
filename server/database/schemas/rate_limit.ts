import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

const rateLimitContextEnum = z.enum(['ip', 'user', 'email', 'global'])
export type RateLimitContext = z.infer<typeof rateLimitContextEnum>

// Rate limit schema with validation rules
export const RateLimitSchema = z.object({
  id: z.string(),
  key: z.string(),
  context: rateLimitContextEnum,
  points: z.number().default(0),
  limit: z.number(),
  window: z.number(), // in seconds
  expiresAt: z.number(),
  blockedUntil: z.number().nullable(),
  createdAt: z.number(),
  updatedAt: z.number().nullable(),
})

// Database interface for Kysely
export interface RateLimit {
  id: Generated<string>
  key: ColumnType<string>
  context: ColumnType<RateLimitContext>
  points: ColumnType<number>
  limit: ColumnType<number>
  window: ColumnType<number>
  expiresAt: ColumnType<number>
  blockedUntil: ColumnType<number | null>
  createdAt: ColumnType<number>
  updatedAt: ColumnType<number | null>
}

// Kysely types for operations
export type RateLimitSelect = Selectable<RateLimit>
export type RateLimitInsert = Insertable<RateLimit>
export type RateLimitUpdate = Updateable<RateLimit>
