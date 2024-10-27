import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'
import { timestampSchema } from '~/database/db.helper'

const invitationRoleEnum = z.enum(['admin', 'member'])
export type InvitationRole = z.infer<typeof invitationRoleEnum>

const invitationStatusEnum = z.enum(['pending', 'accepted', 'expired', 'revoked'])
export type InvitationStatus = z.infer<typeof invitationStatusEnum>

// Invitation schema with validation rules
export const InvitationSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  inviterId: z.string(),
  email: z.string().email(),
  role: invitationRoleEnum,
  status: invitationStatusEnum.default('pending'),
  token: z.string(),
  expiresAt: timestampSchema,
  acceptedAt: timestampSchema.nullable(),
  metadata: z.string().default('{}'),
  createdAt: timestampSchema,
  updatedAt: timestampSchema.nullable(),
})

// Database interface for Kysely
export interface Invitation {
  id: Generated<string>
  organizationId: ColumnType<string>
  inviterId: ColumnType<string>
  email: ColumnType<string>
  role: ColumnType<InvitationRole>
  status: ColumnType<InvitationStatus>
  token: ColumnType<string>
  expiresAt: ColumnType<Date, string, never>
  acceptedAt: ColumnType<Date, string | null, never>
  metadata: ColumnType<string>
  createdAt: ColumnType<Date, string | undefined, never>
  updatedAt: ColumnType<Date, string | undefined, never>
}

// Kysely types for operations
export type InvitationSelect = Selectable<Invitation>
export type InvitationInsert = Insertable<Invitation>
export type InvitationUpdate = Updateable<Invitation>
