import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

// Role permission schema with validation rules
export const RolePermissionSchema = z.object({
  id: z.string(),
  roleId: z.string(),
  permissionId: z.string(),
  conditions: z.string().default('{}'),
  grantedBy: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number().nullable(),
})

// Database interface for Kysely
export interface IRolePermission {
  id: Generated<string>
  roleId: ColumnType<string>
  permissionId: ColumnType<string>
  conditions: ColumnType<string>
  grantedBy: ColumnType<string | null>
  createdAt: ColumnType<number>
  updatedAt: ColumnType<number | null>
}

// Kysely types for operations
export type RolePermission = Selectable<IRolePermission>
export type RolePermissionInsert = Insertable<IRolePermission>
export type RolePermissionUpdate = Updateable<IRolePermission>
