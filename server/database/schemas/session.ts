import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

// Session schema with validation rules
export const SessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  keyId: z.string(),
  refreshToken: z.string(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  deviceId: z.string().nullable(),
  deviceType: z.string().nullable(),
  location: z.string().nullable(),
  isActive: z.number().min(0).max(1).default(1),
  expiresAt: z.number(),
  lastActiveAt: z.number().nullable(),
  createdAt: z.number(),
  updatedAt: z.number().nullable(),
})

// Database interface for Kysely
export interface ISession {
  id: Generated<string>
  userId: ColumnType<string>
  keyId: ColumnType<string>
  refreshToken: ColumnType<string>
  ipAddress: ColumnType<string | null>
  userAgent: ColumnType<string | null>
  deviceId: ColumnType<string | null>
  deviceType: ColumnType<string | null>
  location: ColumnType<string | null>
  isActive: ColumnType<number>
  expiresAt: ColumnType<number>
  lastActiveAt: ColumnType<number | null>
  createdAt: ColumnType<number>
  updatedAt: ColumnType<number | null>
}

// Kysely types for operations
export type Session = Selectable<ISession>
export type SessionInsert = Insertable<ISession>
export type SessionUpdate = Updateable<ISession>
