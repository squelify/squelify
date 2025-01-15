import { LoginRequestSchema, LoginResponseSchema } from '../schema/auth.schema'
import { publicProcedure, trpcRouter } from '../trpc'

export const authRouter = trpcRouter({
  login: publicProcedure
    .input(LoginRequestSchema)
    .output(LoginResponseSchema)
    .mutation(async ({ input }) => {
      // Add your authentication logic here
      const mockResponse = {
        token: 'jwt-token-here',
        user: {
          id: '1',
          email: input.email,
          firstName: 'John',
          lastName: 'Doe',
          avatarUrl: null,
        },
      }
      return mockResponse
    }),
})
