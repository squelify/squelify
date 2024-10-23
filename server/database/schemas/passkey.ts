import type { Insertable, Selectable, Updateable } from 'kysely'
import { z } from 'zod'
import { columnType, generatedType } from '~/database/db.helper'

export const PasskeySchema = z.object({
  id: generatedType<string>(),
  userId: z.string(),
  name: z.string().nullable().default(null),
  publicKey: z.string(),
  webauthnUserId: z.string(),
  counter: z.number().int(),
  deviceType: z.string(),
  backedUp: z.boolean(),
  transports: z.string().nullable().default(null),
  createdAt: columnType<Date>(),
  updatedAt: columnType<Date>(),
})

/**
 * If the column is nullable in the database, make its type nullable.
 * Don't use optional properties. Optionality is always determined
 * automatically by Kysely.
 */
export type PasskeyTable = z.infer<typeof PasskeySchema>

export type Passkey = Selectable<PasskeyTable>
export type PasskeyInsert = Insertable<PasskeyTable>
export type PasskeyUpdate = Updateable<PasskeyTable>
