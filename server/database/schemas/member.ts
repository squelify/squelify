import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

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
  invitedAt: z.number().nullable(),
  joinedAt: z.number().nullable(),
  isDefault: z.number().min(0).max(1).default(0),
  createdAt: z.number(),
  updatedAt: z.number().nullable(),
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
  invitedAt: ColumnType<number | null>
  joinedAt: ColumnType<number | null>
  isDefault: ColumnType<number>
  createdAt: ColumnType<number>
  updatedAt: ColumnType<number | null>
}

// Kysely types for operations
export type MemberSelect = Selectable<Member>
export type MemberInsert = Insertable<Member>
export type MemberUpdate = Updateable<Member>
