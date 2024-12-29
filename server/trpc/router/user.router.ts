import { z } from 'zod'
import userRepo from '~/database/repository/user.repo'
import { type UserInsert, UserSchema } from '~/database/schemas/user'
import { publicProcedure, trpcRouter } from '~/trpc/context'
import type { ContextTRPC } from '~/trpc/types'

// Input schema derived from UserSchema
const CreateUserSchema = UserSchema.pick({
  firstName: true,
  lastName: true,
  username: true,
  avatarUrl: true,
  isActive: true,
})
  .partial({
    lastName: true,
    username: true,
    avatarUrl: true,
    isActive: true,
  })
  .strict()

type CreateUserInput = z.infer<typeof CreateUserSchema>

export const userRouter = trpcRouter({
  list: publicProcedure.query(({ ctx }) => {
    return userRepo(ctx.db).findMany()
  }),

  byId: publicProcedure.input(z.string().uuid()).query(({ ctx, input }) => {
    return userRepo(ctx.db).findById(input)
  }),

  create: publicProcedure
    .input(CreateUserSchema)
    .mutation(async ({ ctx, input }: { ctx: ContextTRPC; input: CreateUserInput }) => {
      return userRepo(ctx.db).create(input as UserInsert)
    }),
})
