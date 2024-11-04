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

// Table interface for Kysely with improved type safety
export interface IRateLimit {
  id: Generated<string>
  key: string
  context: RateLimitContext
  points: number
  limit: number
  window: number
  expiresAt: number
  blockedUntil: number | null
  createdAt?: number
  updatedAt?: number | null
}

// Kysely types for operations with strict typing
export type RateLimit = Selectable<IRateLimit>
export type RateLimitInsert = Insertable<IRateLimit>
export type RateLimitUpdate = Updateable<IRateLimit>

// Constants for rate limiting
export const RATE_LIMIT_DEFAULTS = {
  WINDOW: 60, // 1 minute
  POINTS: 60, // 60 requests per minute
  BLOCK_MULTIPLIER: 2, // Block duration multiplier
} as const
