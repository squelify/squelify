import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

// User role schema with validation rules
export const UserRoleSchema = z.object({
  id: z.string(),
  userId: z.string(),
  roleId: z.string(),
  organizationId: z.string().nullable(),
  grantedBy: z.string().nullable(),
  expiresAt: z.number().nullable(),
  createdAt: z.number(),
  updatedAt: z.number().nullable(),
})

// Database interface for Kysely
export interface IUserRole {
  id: Generated<string>
  userId: ColumnType<string>
  roleId: ColumnType<string>
  organizationId: ColumnType<string | null>
  grantedBy: ColumnType<string | null>
  expiresAt: ColumnType<number | null>
  createdAt: ColumnType<number>
  updatedAt: ColumnType<number | null>
}

// Kysely types for operations
export type UserRole = Selectable<IUserRole>
export type UserRoleInsert = Insertable<IUserRole>
export type UserRoleUpdate = Updateable<IUserRole>
