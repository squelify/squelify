import type { Insertable, Selectable, Updateable } from 'kysely'
import { z } from 'zod'
import { columnType, generatedType } from '~/database/db.helper'

export const JwksSchema = z.object({
  id: generatedType<string>(),
  publicKey: z.string().min(1),
  privateKey: z.string().min(1),
  createdAt: columnType<Date>(),
})

/**
 * If the column is nullable in the database, make its type nullable.
 * Don't use optional properties. Optionality is always determined
 * automatically by Kysely.
 */
export type JwksTable = z.infer<typeof JwksSchema>

export type Jwks = Selectable<JwksTable>
export type JwksInsert = Insertable<JwksTable>
export type JwksUpdate = Updateable<JwksTable>
