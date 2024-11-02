import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

const memberRoleEnum = z.enum(['owner', 'admin', 'member'])
export type MemberRole = z.infer<typeof memberRoleEnum>

// Member schema with validation rules
export const MemberSchema = z.object({
  id: z.custom<Generated<string>>(),
  organizationId: z.string(),
  userId: z.string(),
  role: memberRoleEnum,
  title: z.string().nullable(),
  department: z.string().nullable(),
  invitedBy: z.string().nullable(),
  invitedAt: z.custom<ColumnType<number | null>>().nullable(),
  joinedAt: z.custom<ColumnType<number | null>>().nullable(),
  isDefault: z.number().min(0).max(1).default(0),
  createdAt: z.custom<ColumnType<number>>().optional(),
  updatedAt: z.custom<ColumnType<number | null>>().nullable(),
})

// Table interface for Kysely
export type IMember = z.infer<typeof MemberSchema>

// Kysely types for operations
export type Member = Selectable<IMember>
export type MemberInsert = Insertable<IMember>
export type MemberUpdate = Updateable<IMember>
