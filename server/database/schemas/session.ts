import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'
import { booleanSchema, timestampSchema } from '~/database/db.helper'

// Session schema with validation rules
export const SessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  refreshToken: z.string(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  deviceId: z.string().nullable(),
  deviceType: z.string().nullable(),
  location: z.string().nullable(),
  keyId: z.string(),
  isActive: booleanSchema.default(1),
  expiresAt: timestampSchema,
  lastActiveAt: timestampSchema.nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema.nullable(),
})

// Database interface for Kysely
export interface Session {
  id: Generated<string>
  userId: ColumnType<string>
  refreshToken: ColumnType<string>
  ipAddress: ColumnType<string | null>
  userAgent: ColumnType<string | null>
  deviceId: ColumnType<string | null>
  deviceType: ColumnType<string | null>
  location: ColumnType<string | null>
  keyId: ColumnType<string>
  isActive: ColumnType<number>
  expiresAt: ColumnType<Date, string, never>
  lastActiveAt: ColumnType<Date, string | null, never>
  createdAt: ColumnType<Date, string | undefined, never>
  updatedAt: ColumnType<Date, string | undefined, never>
}

// Kysely types for operations
export type SessionSelect = Selectable<Session>
export type SessionInsert = Insertable<Session>
export type SessionUpdate = Updateable<Session>
