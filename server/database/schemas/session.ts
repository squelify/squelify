import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

// Session schema with validation rules
export const SessionSchema = z.object({
  id: z.custom<Generated<string>>(),
  userId: z.string(),
  keyId: z.string(),
  refreshToken: z.string(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  deviceId: z.string().nullable(),
  deviceType: z.string().nullable(),
  location: z.string().nullable(),
  isActive: z.number().min(0).max(1).default(1),
  expiresAt: z.custom<ColumnType<number>>(),
  lastActiveAt: z.custom<ColumnType<number | null>>().nullable(),
  createdAt: z.custom<ColumnType<number>>().optional(),
  updatedAt: z.custom<ColumnType<number | null>>().nullable(),
  archivedAt: z.custom<ColumnType<number | null>>().nullable(),
})

// Table interface for Kysely
export type ISession = z.infer<typeof SessionSchema>

// Kysely types for operations
export type Session = Selectable<ISession>
export type SessionInsert = Insertable<ISession>
export type SessionUpdate = Updateable<ISession>
