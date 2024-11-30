import { z } from 'zod'
import userRepo from '~/database/repository/user.repo'
import { UserSchema } from '~/database/schemas/user'
import { publicProcedure, router } from '../trpc'

export const userRouter = router({
  list: publicProcedure.query(({ ctx }) => {
    return userRepo(ctx.db).findMany()
  }),

  byId: publicProcedure.input(z.string().uuid()).query(({ ctx, input }) => {
    return userRepo(ctx.db).findById(input)
  }),

  create: publicProcedure
    .input(
      z.object({
        firstName: UserSchema.shape.firstName,
        lastName: UserSchema.shape.lastName,
        username: UserSchema.shape.username,
        avatarUrl: UserSchema.shape.avatarUrl,
      })
    )
    .mutation(({ ctx, input }) => {
      return userRepo(ctx.db).create(input)
    }),
})
