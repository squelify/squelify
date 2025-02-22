import { z } from 'zod'
import { DURATION } from '~/utils/datetime'
import { LoginRequestSchema, LoginResponseSchema } from '../schema/auth.schema'
import { publicProcedure, trpcRouter } from '../trpc'

export const authRouter = trpcRouter({
  login: publicProcedure
    .input(LoginRequestSchema)
    .output(LoginResponseSchema)
    .mutation(async ({ input }) => {
      const now = Math.floor(Date.now() / 1000)

      const response: z.infer<typeof LoginResponseSchema> = {
        accessToken: 'jwt-token-here',
        refreshToken: 'jwt-refresh-token-here',
        accessTokenExpiry: now + DURATION.DAY * 7,
        refreshTokenExpiry: now + DURATION.DAY * 30,
        user: {
          id: '1',
          email: input.email,
          firstName: 'John',
          lastName: 'Doe',
          avatarUrl: null,
        },
      }
      return response
    }),
})
