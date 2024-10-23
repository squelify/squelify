import type { Insertable, Selectable, Updateable } from 'kysely'
import { z } from 'zod'
import { columnType, generatedType } from '~/database/db.helper'

export const VerificationSchema = z.object({
  id: generatedType<string>(),
  identifier: z.string(),
  value: z.string(),
  expiresAt: columnType<Date>(),
  createdAt: columnType<Date>(),
})

/**
 * If the column is nullable in the database, make its type nullable.
 * Don't use optional properties. Optionality is always determined
 * automatically by Kysely.
 */
export type VerificationTable = z.infer<typeof VerificationSchema>

export type Verification = Selectable<VerificationTable>
export type VerificationInsert = Insertable<VerificationTable>
export type VerificationUpdate = Updateable<VerificationTable>
