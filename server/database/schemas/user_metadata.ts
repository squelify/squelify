import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

export const UserMetadataSchema = z.object({
  id: z.custom<Generated<string>>(),
  userId: z.string().min(1, 'User ID harus diisi'),
  key: z.string().min(1, 'Key harus diisi'),
  value: z.string().min(1, 'Value harus diisi'),
  isPublic: z.number().min(0).max(1).default(0),
  createdAt: z.custom<ColumnType<number>>().optional(),
  updatedAt: z.custom<ColumnType<number | null>>().nullable(),
})

export type IUserMetadata = z.infer<typeof UserMetadataSchema>
export type UserMetadata = Selectable<IUserMetadata>
export type UserMetadataInsert = Insertable<IUserMetadata>
export type UserMetadataUpdate = Updateable<IUserMetadata>
