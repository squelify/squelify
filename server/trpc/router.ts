import { authRouter } from './router/auth.router'
import { userRouter } from './router/user.router'
import { trpcRouter } from './trpc'

const appRouter = trpcRouter({
  auth: authRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter

export { appRouter }
