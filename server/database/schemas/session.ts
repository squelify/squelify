import type { Insertable, Selectable, Updateable } from 'kysely'
import { z } from 'zod'
import { columnType, generatedType } from '~/database/db.helper'

export const SessionSchema = z.object({
  id: generatedType<string>(),
  userId: z.string(),
  ipAddress: z.string().nullable().default(null),
  userAgent: z.string().nullable().default(null),
  impersonatedBy: z.string().nullable().default(null),
  activeOrganizationId: z.string().nullable().default(null),
  expiresAt: columnType<Date>(),
})

export type SessionTable = z.infer<typeof SessionSchema>
export type Session = Selectable<SessionTable>
export type SessionInsert = Insertable<SessionTable>
export type SessionUpdate = Updateable<SessionTable>

export const RateLimitSchema = z.object({
  key: z.string(),
  max: z.number().int(),
  window: z.number().int(),
  count: z.number().int(),
  lastRequest: columnType<Date>(),
})

export type RateLimitTable = z.infer<typeof RateLimitSchema>

export type RateLimit = Selectable<RateLimitTable>
export type RateLimitInsert = Insertable<RateLimitTable>
export type RateLimitUpdate = Updateable<RateLimitTable>
