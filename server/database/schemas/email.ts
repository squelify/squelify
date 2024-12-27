import type { Generated, Insertable, Selectable, Updateable } from 'kysely'
import { z } from 'zod'

// Email schema with validation rules
export const EmailSchema = z.object({
  id: z.custom<Generated<string>>(),
  userId: z.string(),
  email: z.string().email({ message: 'Invalid email address' }),
  isPrimary: z.number().min(0).max(1).default(0),
  verifiedAt: z.string().datetime({ offset: true }).nullable(),
  createdAt: z.string().datetime({ offset: true }).optional(),
  updatedAt: z.string().datetime({ offset: true }).nullable(),
})

// Table interface for Kysely
export type IEmail = z.infer<typeof EmailSchema>

// Kysely types for operations
export type Email = Selectable<IEmail>
export type EmailInsert = Insertable<IEmail>
export type EmailUpdate = Updateable<IEmail>
