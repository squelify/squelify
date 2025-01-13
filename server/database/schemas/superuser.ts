import type { Generated, Insertable, Selectable, Updateable } from 'kysely'
import { z } from 'zod'

// Superuser schema with validation rules
export const SuperuserSchema = z.object({
  id: z.custom<Generated<string>>(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().nullable(),
  username: z
    .string()
    .min(4, 'Username must be at least 4 characters')
    .max(50, 'Username must be a maximum of 50 characters')
    .regex(/^[a-z0-9_]+$/, 'Usernames may only contain lowercase letters, numbers and underscores')
    .nullable(),
  avatarUrl: z.string().url('Invalid avatar URL').nullable(),
  isActive: z.number().min(0).max(1).default(1),
  createdAt: z.string().datetime({ offset: true }).optional(),
  updatedAt: z.string().datetime({ offset: true }).nullable(),
  deletedAt: z.string().datetime({ offset: true }).nullable(),
})

// Table interface for Kysely
export type ISuperuser = z.infer<typeof SuperuserSchema>

// Kysely types for operations
export type Superuser = Selectable<ISuperuser>
export type SuperuserInsert = Insertable<ISuperuser>
export type SuperuserUpdate = Updateable<ISuperuser>
