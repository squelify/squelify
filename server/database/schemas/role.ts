import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

const roleTypeEnum = z.enum(['system', 'organization', 'custom'])
export type RoleType = z.infer<typeof roleTypeEnum>

// Role schema with validation rules
export const RoleSchema = z.object({
  id: z.string(),
  name: z.string().min(3),
  description: z.string().nullable(),
  type: roleTypeEnum,
  organizationId: z.string().nullable(),
  isDefault: z.number().min(0).max(1).default(0),
  metadata: z.string().default('{}'),
  createdAt: z.number(),
  updatedAt: z.number().nullable(),
})

// Database interface for Kysely
export interface Role {
  id: Generated<string>
  name: ColumnType<string>
  description: ColumnType<string | null>
  type: ColumnType<RoleType>
  organizationId: ColumnType<string | null>
  isDefault: ColumnType<number>
  metadata: ColumnType<string>
  createdAt: ColumnType<number>
  updatedAt: ColumnType<number | null>
}

// Kysely types for operations
export type RoleSelect = Selectable<Role>
export type RoleInsert = Insertable<Role>
export type RoleUpdate = Updateable<Role>
