import type { Insertable, Selectable, Updateable } from 'kysely'
import { z } from 'zod'
import { columnType, generatedType } from '~/database/db.helper'

export const InvitationSchema = z.object({
  id: generatedType<string>(),
  organizationId: z.string(),
  inviterId: z.string(),
  email: z.string(),
  role: z.string().nullable().default(null),
  status: z.string(),
  expiresAt: columnType<Date>(),
  createdAt: columnType<Date>(),
})

export type InvitationTable = z.infer<typeof InvitationSchema>
export type Invitation = Selectable<InvitationTable>
export type InvitationInsert = Insertable<InvitationTable>
export type InvitationUpdate = Updateable<InvitationTable>
