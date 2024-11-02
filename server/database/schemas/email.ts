import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

// Email schema with validation rules
export const EmailSchema = z.object({
  id: z.custom<Generated<string>>(),
  userId: z.string(),
  email: z.string().email({ message: 'Invalid email address' }),
  isPrimary: z.number().min(0).max(1).default(0),
  isVerified: z.number().min(0).max(1).default(0),
  verifiedAt: z.custom<ColumnType<number | null>>().nullable(),
  createdAt: z.custom<ColumnType<number>>().optional(),
  updatedAt: z.custom<ColumnType<number | null>>().nullable(),
})

// Table interface for Kysely
export type IEmail = z.infer<typeof EmailSchema>

// Kysely types for operations
export type Email = Selectable<IEmail>
export type EmailInsert = Insertable<IEmail>
export type EmailUpdate = Updateable<IEmail>
