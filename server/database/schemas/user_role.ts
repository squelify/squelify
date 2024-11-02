import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

// User role schema with validation rules
export const UserRoleSchema = z.object({
  id: z.custom<Generated<string>>(),
  userId: z.string(),
  roleId: z.string(),
  organizationId: z.string().nullable(),
  grantedBy: z.string().nullable(),
  expiresAt: z.custom<ColumnType<number | null>>().nullable(),
  createdAt: z.custom<ColumnType<number>>().optional(),
  updatedAt: z.custom<ColumnType<number | null>>().nullable(),
})

// Table interface for Kysely
export type IUserRole = z.infer<typeof UserRoleSchema>

// Kysely types for operations
export type UserRole = Selectable<IUserRole>
export type UserRoleInsert = Insertable<IUserRole>
export type UserRoleUpdate = Updateable<IUserRole>
