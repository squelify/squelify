import type { Insertable, Selectable, Updateable } from 'kysely'
import { z } from 'zod'
import { columnType, generatedType } from '~/database/db.helper'

export const MemberSchema = z.object({
  id: generatedType<string>(),
  organizationId: z.string(),
  userId: z.string(),
  email: z.string(),
  role: z.string(),
  createdAt: columnType<Date>(),
})

export type MemberTable = z.infer<typeof MemberSchema>
export type Member = Selectable<MemberTable>
export type MemberInsert = Insertable<MemberTable>
export type MemberUpdate = Updateable<MemberTable>
