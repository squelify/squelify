import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'
import { timestampSchema } from '~/database/db.helper'

// User role schema with validation rules
export const UserRoleSchema = z.object({
  id: z.string(),
  userId: z.string(),
  roleId: z.string(),
  organizationId: z.string().nullable(),
  grantedBy: z.string().nullable(),
  expiresAt: timestampSchema.nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema.nullable(),
})

// Database interface for Kysely
export interface UserRole {
  id: Generated<string>
  userId: ColumnType<string>
  roleId: ColumnType<string>
  organizationId: ColumnType<string | null>
  grantedBy: ColumnType<string | null>
  expiresAt: ColumnType<Date, string | null, never>
  createdAt: ColumnType<Date, string | undefined, never>
  updatedAt: ColumnType<Date, string | undefined, never>
}

// Kysely types for operations
export type UserRoleSelect = Selectable<UserRole>
export type UserRoleInsert = Insertable<UserRole>
export type UserRoleUpdate = Updateable<UserRole>
