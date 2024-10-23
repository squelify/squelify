import type { Insertable, Selectable, Updateable } from 'kysely'
import { z } from 'zod'
import { columnType, generatedType } from '~/database/db.helper'

export const TwoFactorSchema = z.object({
  id: generatedType<string>(),
  userId: z.string(),
  secret: z.string(),
  backupCodes: z.string(),
  createdAt: columnType<Date>(),
  updatedAt: columnType<Date>(),
})

/**
 * If the column is nullable in the database, make its type nullable.
 * Don't use optional properties. Optionality is always determined
 * automatically by Kysely.
 */
export type TwoFactorTable = z.infer<typeof TwoFactorSchema>

export type TwoFactor = Selectable<TwoFactorTable>
export type TwoFactorInsert = Insertable<TwoFactorTable>
export type TwoFactorUpdate = Updateable<TwoFactorTable>
