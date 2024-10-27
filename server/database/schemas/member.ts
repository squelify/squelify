import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'
import { booleanSchema, timestampSchema } from '~/database/db.helper'

const memberRoleEnum = z.enum(['owner', 'admin', 'member'])
export type MemberRole = z.infer<typeof memberRoleEnum>

// Member schema with validation rules
export const MemberSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  role: memberRoleEnum,
  title: z.string().nullable(),
  department: z.string().nullable(),
  invitedBy: z.string().nullable(),
  invitedAt: timestampSchema.nullable(),
  joinedAt: timestampSchema.nullable(),
  isDefault: booleanSchema.default(0),
  createdAt: timestampSchema,
  updatedAt: timestampSchema.nullable(),
})

// Database interface for Kysely
export interface Member {
  id: Generated<string>
  organizationId: ColumnType<string>
  userId: ColumnType<string>
  role: ColumnType<MemberRole>
  title: ColumnType<string | null>
  department: ColumnType<string | null>
  invitedBy: ColumnType<string | null>
  invitedAt: ColumnType<Date, string | null, never>
  joinedAt: ColumnType<Date, string | null, never>
  isDefault: ColumnType<number>
  createdAt: ColumnType<Date, string | undefined, never>
  updatedAt: ColumnType<Date, string | undefined, never>
}

// Kysely types for operations
export type MemberSelect = Selectable<Member>
export type MemberInsert = Insertable<Member>
export type MemberUpdate = Updateable<Member>
