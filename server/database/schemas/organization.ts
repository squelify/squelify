import type { Insertable, Selectable, Updateable } from 'kysely'
import { z } from 'zod'
import { columnType, generatedType } from '~/database/db.helper'

export const OrganizationSchema = z.object({
  id: generatedType<string>(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().nullable().default(null),
  metadata: z.string().nullable().default(null),
  createdAt: columnType<Date>(),
  updatedAt: columnType<Date>(),
})

export type OrganizationTable = z.infer<typeof OrganizationSchema>
export type Organization = Selectable<OrganizationTable>
export type OrganizationInsert = Insertable<OrganizationTable>
export type OrganizationUpdate = Updateable<OrganizationTable>
