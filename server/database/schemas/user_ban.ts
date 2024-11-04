import type { Insertable, Selectable, Updateable } from 'kysely'
import type { ColumnType, Generated } from 'kysely'
import { z } from 'zod'

export const UserBanSchema = z.object({
  id: z.custom<Generated<string>>(),
  userId: z.string().min(1, 'User ID harus diisi'),
  bannedBy: z.string().nullable(),
  reason: z.string().min(1, 'Alasan ban harus diisi'),
  details: z.string().default('{}'),
  expiresAt: z.custom<ColumnType<number | null>>().nullable(),
  appealStatus: z.enum(['none', 'pending', 'approved', 'rejected']).default('none'),
  appealReason: z.string().nullable(),
  appealReviewedBy: z.string().nullable(),
  appealReviewedAt: z.custom<ColumnType<number | null>>().nullable(),
  createdAt: z.custom<ColumnType<number>>().optional(),
  updatedAt: z.custom<ColumnType<number | null>>().nullable(),
})

export type IUserBan = z.infer<typeof UserBanSchema>
export type UserBan = Selectable<IUserBan>
export type UserBanInsert = Insertable<IUserBan>
export type UserBanUpdate = Updateable<IUserBan>
