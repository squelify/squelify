import type { AuthenticatorTransportFuture } from '@simplewebauthn/typescript-types'
import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

// Passkey schema with validation rules
export const PasskeySchema = z.object({
  id: z.custom<Generated<string>>(),
  userId: z.string(),
  webauthnUserId: z.string(),
  name: z.string(),
  credentialId: z.string(),
  credentialPublicKey: z.string(),
  counter: z.number().default(0),
  transports: z.array(z.string() as z.ZodType<AuthenticatorTransportFuture>).nullable(),
  rpId: z.string(),
  origin: z.string(),
  lastUsedAt: z.custom<ColumnType<number | null>>().nullable(),
  createdAt: z.custom<ColumnType<number>>().optional(),
  updatedAt: z.custom<ColumnType<number | null>>().nullable(),
})

// Table interface for Kysely
export type IPasskey = z.infer<typeof PasskeySchema>

// Kysely types for operations
export type Passkey = Selectable<IPasskey>
export type PasskeyInsert = Insertable<IPasskey>
export type PasskeyUpdate = Updateable<IPasskey>
