import { z } from 'zod'
import { UserSchema } from '~/database/schemas/user'
import { dbService } from './db'
import { publicProcedure, router } from './trpc'

export const appRouter = router({
  userList: publicProcedure.query(async () => {
    return await dbService.user.findMany()
  }),

  userById: publicProcedure.input(z.string().uuid()).query(async ({ input }) => {
    return await dbService.user.findById(input)
  }),

  userCreate: publicProcedure
    .input(
      z.object({
        firstName: UserSchema.shape.firstName,
        lastName: UserSchema.shape.lastName,
        username: UserSchema.shape.username,
        avatarUrl: UserSchema.shape.avatarUrl,
      })
    )
    .mutation(async ({ input }) => {
      return await dbService.user.create(input)
    }),
})

export type AppRouter = typeof appRouter
