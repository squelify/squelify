import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

const roleTypeEnum = z.enum(['system', 'organization', 'custom'])
export type RoleType = z.infer<typeof roleTypeEnum>

// Role metadata schema
export const RoleMetadataSchema = z
  .object({
    scope: z.string().optional(),
    priority: z.number().optional(),
    department: z.string().optional(),
    level: z.number().optional(),
    access: z.string().optional(),
  })
  .or(z.record(z.unknown()))

// Role schema with validation rules
export const RoleSchema = z.object({
  id: z.custom<Generated<string>>(),
  name: z.string().min(3),
  description: z.string().nullable(),
  type: roleTypeEnum,
  organizationId: z.string().nullable(),
  isDefault: z.number().min(0).max(1).default(0),
  metadata: z
    .union([z.string().transform((val) => JSON.parse(val)), RoleMetadataSchema])
    .transform((val) => val),
  createdAt: z.custom<ColumnType<number>>().optional(),
  updatedAt: z.custom<ColumnType<number | null>>().nullable(),
})

// Table interface for Kysely
export type IRole = z.infer<typeof RoleSchema>

// Kysely types for operations
export type Role = Selectable<IRole>
export type RoleInsert = Insertable<IRole>
export type RoleUpdate = Updateable<IRole>
