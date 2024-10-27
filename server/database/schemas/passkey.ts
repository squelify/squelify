import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'
import { booleanSchema, timestampSchema } from '~/database/db.helper'

const credentialDeviceTypeEnum = z.enum(['platform', 'cross-platform'])
export type CredentialDeviceType = z.infer<typeof credentialDeviceTypeEnum>

// Passkey schema with validation rules
export const PasskeySchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  credentialId: z.string(),
  publicKey: z.string(),
  signCount: z.number().default(0),
  transports: z.string().nullable(),
  attestationFormat: z.string().nullable(),
  aaguid: z.string().nullable(),
  credentialDeviceType: credentialDeviceTypeEnum,
  credentialBackedUp: booleanSchema.default(0),
  lastUsedAt: timestampSchema.nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema.nullable(),
})

// Database interface for Kysely
export interface Passkey {
  id: Generated<string>
  userId: ColumnType<string>
  name: ColumnType<string>
  credentialId: ColumnType<string>
  publicKey: ColumnType<string>
  signCount: ColumnType<number>
  transports: ColumnType<string | null>
  attestationFormat: ColumnType<string | null>
  aaguid: ColumnType<string | null>
  credentialDeviceType: ColumnType<CredentialDeviceType>
  credentialBackedUp: ColumnType<number>
  lastUsedAt: ColumnType<Date, string | null, never>
  createdAt: ColumnType<Date, string | undefined, never>
  updatedAt: ColumnType<Date, string | undefined, never>
}

// Kysely types for operations
export type PasskeySelect = Selectable<Passkey>
export type PasskeyInsert = Insertable<Passkey>
export type PasskeyUpdate = Updateable<Passkey>
