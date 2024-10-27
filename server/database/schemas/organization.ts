import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'
import { booleanSchema, timestampSchema } from '~/database/db.helper'

const organizationStatusEnum = z.enum(['active', 'inactive', 'suspended'])
export type OrganizationStatus = z.infer<typeof organizationStatusEnum>

// Organization schema with validation rules
export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().min(3),
  description: z.string().nullable(),
  logoUrl: z.string().nullable(),
  website: z.string().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  status: organizationStatusEnum.default('active'),
  settings: z.string().default('{}'),
  metadata: z.string().default('{}'),
  isVerified: booleanSchema.default(0),
  createdAt: timestampSchema,
  updatedAt: timestampSchema.nullable(),
})

// Database interface for Kysely
export interface Organization {
  id: Generated<string>
  name: ColumnType<string>
  slug: ColumnType<string>
  description: ColumnType<string | null>
  logoUrl: ColumnType<string | null>
  website: ColumnType<string | null>
  email: ColumnType<string | null>
  phone: ColumnType<string | null>
  address: ColumnType<string | null>
  status: ColumnType<OrganizationStatus>
  settings: ColumnType<string>
  metadata: ColumnType<string>
  isVerified: ColumnType<number>
  createdAt: ColumnType<Date, string | undefined, never>
  updatedAt: ColumnType<Date, string | undefined, never>
}

// Kysely types for operations
export type OrganizationSelect = Selectable<Organization>
export type OrganizationInsert = Insertable<Organization>
export type OrganizationUpdate = Updateable<Organization>
