import { trpcRouter } from './context'
import { userRouter } from './router/user.router'

const appRouter = trpcRouter({
  user: userRouter,
})

export type AppRouter = typeof appRouter

export { appRouter }
