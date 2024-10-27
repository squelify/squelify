import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'
import { timestampSchema } from '~/database/db.helper'

// Role permission schema with validation rules
export const RolePermissionSchema = z.object({
  id: z.string(),
  roleId: z.string(),
  permissionId: z.string(),
  conditions: z.string().default('{}'),
  grantedBy: z.string().nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema.nullable(),
})

// Database interface for Kysely
export interface RolePermission {
  id: Generated<string>
  roleId: ColumnType<string>
  permissionId: ColumnType<string>
  conditions: ColumnType<string>
  grantedBy: ColumnType<string | null>
  createdAt: ColumnType<Date, string | undefined, never>
  updatedAt: ColumnType<Date, string | undefined, never>
}

// Kysely types for operations
export type RolePermissionSelect = Selectable<RolePermission>
export type RolePermissionInsert = Insertable<RolePermission>
export type RolePermissionUpdate = Updateable<RolePermission>
