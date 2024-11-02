import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

const permissionCategoryEnum = z.enum(['system', 'user', 'organization', 'content'])
export type PermissionCategory = z.infer<typeof permissionCategoryEnum>

const permissionActionEnum = z.enum(['create', 'read', 'update', 'delete', 'manage'])
export type PermissionAction = z.infer<typeof permissionActionEnum>

// Permission schema with validation rules
export const PermissionSchema = z.object({
  id: z.custom<Generated<string>>(),
  name: z.string().min(3),
  description: z.string().nullable(),
  category: permissionCategoryEnum,
  action: permissionActionEnum,
  resource: z.string(),
  conditions: z.string().default('{}'),
  createdAt: z.custom<ColumnType<number>>().optional(),
  updatedAt: z.custom<ColumnType<number | null>>().nullable(),
})

// Table interface for Kysely
export type IPermission = z.infer<typeof PermissionSchema>

// Kysely types for operations
export type Permission = Selectable<IPermission>
export type PermissionInsert = Insertable<IPermission>
export type PermissionUpdate = Updateable<IPermission>
