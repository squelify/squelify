import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

const invitationRoleEnum = z.enum(['org:admin', 'org:member'])
export type InvitationRole = z.infer<typeof invitationRoleEnum>

const invitationStatusEnum = z.enum(['pending', 'accepted', 'expired', 'revoked'])
export type InvitationStatus = z.infer<typeof invitationStatusEnum>

// Invitation schema with validation rules
export const InvitationSchema = z.object({
  id: z.custom<Generated<string>>(),
  organizationId: z.string(),
  email: z.string().email(),
  role: invitationRoleEnum,
  token: z.string(),
  invitedBy: z.string(),
  status: invitationStatusEnum.default('pending'),
  expiresAt: z.custom<ColumnType<number>>(),
  acceptedAt: z.custom<ColumnType<number | null>>().nullable(),
  metadata: z.string().default('{}'),
  createdAt: z.custom<ColumnType<number>>().optional(),
  updatedAt: z.custom<ColumnType<number | null>>().nullable(),
})

// Table interface for Kysely
export type IInvitation = z.infer<typeof InvitationSchema>

// Kysely types for operations
export type Invitation = Selectable<IInvitation>
export type InvitationInsert = Insertable<IInvitation>
export type InvitationUpdate = Updateable<IInvitation>
