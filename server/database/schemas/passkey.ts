import type { AuthenticatorTransportFuture } from '@simplewebauthn/typescript-types'
import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

// Passkey schema with validation rules
export const PasskeySchema = z.object({
  id: z.string(),
  userId: z.string(),
  webauthnUserId: z.string(),
  name: z.string(),
  credentialId: z.string(),
  credentialPublicKey: z.string(),
  counter: z.number().default(0),
  transports: z.array(z.string() as z.ZodType<AuthenticatorTransportFuture>).nullable(),
  rpId: z.string(),
  origin: z.string(),
  lastUsedAt: z.number().nullable(),
  createdAt: z.number(),
  updatedAt: z.number().nullable(),
})

// Database interface for Kysely
export interface IPasskey {
  id: Generated<string>
  userId: ColumnType<string>
  webauthnUserId: ColumnType<string>
  name: ColumnType<string>
  credentialId: ColumnType<string>
  credentialPublicKey: ColumnType<string>
  counter: ColumnType<number>
  transports: ColumnType<AuthenticatorTransportFuture[] | null>
  rpId: ColumnType<string>
  origin: ColumnType<string>
  lastUsedAt: ColumnType<number | null>
  createdAt: ColumnType<number>
  updatedAt: ColumnType<number | null>
}

// Kysely types for operations
export type Passkey = Selectable<IPasskey>
export type PasskeyInsert = Insertable<IPasskey>
export type PasskeyUpdate = Updateable<IPasskey>
