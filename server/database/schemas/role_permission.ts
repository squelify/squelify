import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

// Role permission schema with validation rules
export const RolePermissionSchema = z.object({
  id: z.custom<Generated<string>>(),
  roleId: z.string(),
  permissionId: z.string(),
  conditions: z.string().default('{}'),
  grantedBy: z.string().nullable(),
  createdAt: z.custom<ColumnType<number>>().optional(),
  updatedAt: z.custom<ColumnType<number | null>>().nullable(),
})

// Table interface for Kysely
export type IRolePermission = z.infer<typeof RolePermissionSchema>

// Kysely types for operations
export type RolePermission = Selectable<IRolePermission>
export type RolePermissionInsert = Insertable<IRolePermission>
export type RolePermissionUpdate = Updateable<IRolePermission>
