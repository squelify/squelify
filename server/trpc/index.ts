import { initTRPC } from '@trpc/server'
import type { H3Event } from 'h3'
import superjson from 'superjson'
import { userRouter } from './router/user.router'
import type { ContextTRPC } from './types'

function createContext(event: H3Event): ContextTRPC {
  return {
    event,
    db: event.context.db,
    appConfig: event.context.appConfig,
  }
}

const t = initTRPC.context<ContextTRPC>().create({
  transformer: superjson,
})

const router = t.router
const publicProcedure = t.procedure

const appRouter = router({
  user: userRouter,
})

export type AppRouter = typeof appRouter

export { router, createContext, appRouter, publicProcedure }
