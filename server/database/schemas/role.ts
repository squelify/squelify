import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'
import { booleanSchema, timestampSchema } from '~/database/db.helper'

const roleTypeEnum = z.enum(['system', 'organization', 'custom'])
export type RoleType = z.infer<typeof roleTypeEnum>

// Role schema with validation rules
export const RoleSchema = z.object({
  id: z.string(),
  name: z.string().min(3),
  description: z.string().nullable(),
  type: roleTypeEnum,
  organizationId: z.string().nullable(),
  isDefault: booleanSchema.default(0),
  metadata: z.string().default('{}'),
  createdAt: timestampSchema,
  updatedAt: timestampSchema.nullable(),
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
  createdAt: ColumnType<Date, string | undefined, never>
  updatedAt: ColumnType<Date, string | undefined, never>
}

// Kysely types for operations
export type RoleSelect = Selectable<Role>
export type RoleInsert = Insertable<Role>
export type RoleUpdate = Updateable<Role>
