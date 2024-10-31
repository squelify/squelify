import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

const invitationRoleEnum = z.enum(['admin', 'member'])
export type InvitationRole = z.infer<typeof invitationRoleEnum>

const invitationStatusEnum = z.enum(['pending', 'accepted', 'expired', 'revoked'])
export type InvitationStatus = z.infer<typeof invitationStatusEnum>

// Invitation schema with validation rules
export const InvitationSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  email: z.string().email(),
  role: invitationRoleEnum,
  token: z.string(),
  invitedBy: z.string(),
  status: invitationStatusEnum.default('pending'),
  expiresAt: z.number(),
  acceptedAt: z.number().nullable(),
  metadata: z.string().default('{}'),
  createdAt: z.number(),
  updatedAt: z.number().nullable(),
})

// Database interface for Kysely
export interface Invitation {
  id: Generated<string>
  organizationId: ColumnType<string>
  email: ColumnType<string>
  role: ColumnType<InvitationRole>
  token: ColumnType<string>
  invitedBy: ColumnType<string>
  status: ColumnType<InvitationStatus>
  expiresAt: ColumnType<number>
  acceptedAt: ColumnType<number | null>
  metadata: ColumnType<string>
  createdAt: ColumnType<number>
  updatedAt: ColumnType<number | null>
}

// Kysely types for operations
export type InvitationSelect = Selectable<Invitation>
export type InvitationInsert = Insertable<Invitation>
export type InvitationUpdate = Updateable<Invitation>
