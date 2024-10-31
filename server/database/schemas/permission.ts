import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

const permissionCategoryEnum = z.enum(['system', 'user', 'organization', 'content'])
export type PermissionCategory = z.infer<typeof permissionCategoryEnum>

const permissionActionEnum = z.enum(['create', 'read', 'update', 'delete', 'manage'])
export type PermissionAction = z.infer<typeof permissionActionEnum>

// Permission schema with validation rules
export const PermissionSchema = z.object({
  id: z.string(),
  name: z.string().min(3),
  description: z.string().nullable(),
  category: permissionCategoryEnum,
  action: permissionActionEnum,
  resource: z.string(),
  conditions: z.string().default('{}'),
  createdAt: z.number(),
  updatedAt: z.number().nullable(),
})

// Database interface for Kysely
export interface Permission {
  id: Generated<string>
  name: ColumnType<string>
  description: ColumnType<string | null>
  category: ColumnType<PermissionCategory>
  action: ColumnType<PermissionAction>
  resource: ColumnType<string>
  conditions: ColumnType<string>
  createdAt: ColumnType<number>
  updatedAt: ColumnType<number | null>
}

// Kysely types for operations
export type PermissionSelect = Selectable<Permission>
export type PermissionInsert = Insertable<Permission>
export type PermissionUpdate = Updateable<Permission>
