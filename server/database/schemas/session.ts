import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'
import { timestampSchema } from '~/database/db.helper'

// Session schema with validation rules
export const SessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  impersonatedBy: z.string().nullable(),
  activeOrganizationId: z.string().nullable(),
  expiresAt: timestampSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema.nullable(),
})

// Database interface for Kysely
export interface Session {
  id: Generated<string>
  userId: ColumnType<string>
  ipAddress: ColumnType<string | null>
  userAgent: ColumnType<string | null>
  impersonatedBy: ColumnType<string | null>
  activeOrganizationId: ColumnType<string | null>
  expiresAt: ColumnType<Date, string, never>
  createdAt: ColumnType<Date, string | undefined, never>
  updatedAt: ColumnType<Date, string | undefined, never>
}

// Kysely types for operations
export type SessionSelect = Selectable<Session>
export type SessionInsert = Insertable<Session>
export type SessionUpdate = Updateable<Session>
