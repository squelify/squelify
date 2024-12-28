import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

const organizationStatusEnum = z.enum(['active', 'inactive', 'suspended'])
export type OrganizationStatus = z.infer<typeof organizationStatusEnum>

// Organization schema with validation rules
export const OrganizationSchema = z.object({
  id: z.custom<Generated<string>>(),
  name: z.string().min(3, 'Nama organisasi minimal 3 karakter'),
  slug: z
    .string()
    .min(3, 'Slug minimal 3 karakter')
    .max(50, 'Slug maksimal 50 karakter')
    .regex(/^[a-z]/, 'Slug harus diawali huruf kecil')
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung')
    .regex(/[a-z0-9]$/, 'Slug harus diakhiri huruf atau angka')
    .regex(/^[^-].*[^-]$/, 'Slug tidak boleh diawali atau diakhiri tanda hubung')
    .regex(/^[^0-9]/, 'Slug tidak boleh diawali angka')
    .regex(/^(?!.*--).+$/, 'Slug tidak boleh mengandung tanda hubung berurutan'),
  description: z.string().nullable(),
  logoUrl: z.string().url('URL logo tidak valid').nullable(),
  website: z.string().url('URL website tidak valid').nullable(),
  email: z.string().email('Email tidak valid').nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  status: organizationStatusEnum.default('active'),
  settings: z.string().default('{}'),
  metadata: z.string().default('{}'),
  isVerified: z.number().min(0).max(1).default(0),
  createdBy: z.string(),
  createdAt: z.custom<ColumnType<number>>().optional(),
  updatedAt: z.custom<ColumnType<number | null>>().nullable(),
})

// Table interface for Kysely
export type IOrganization = z.infer<typeof OrganizationSchema>

// Kysely types for operations
export type Organization = Selectable<IOrganization>
export type OrganizationInsert = Insertable<IOrganization>
export type OrganizationUpdate = Updateable<IOrganization>
