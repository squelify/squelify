import { TRPCError, initTRPC } from '@trpc/server'
import type { H3Event } from 'h3'
import superjson from 'superjson'
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
  errorFormatter({ shape }) {
    return shape
  },
})

const trpcMiddleware = t.middleware
const trpcRouter = t.router

const isAuthenticated = trpcMiddleware(({ ctx, next }) => {
  if (!ctx.event.context.auth?.sessionId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      sesssionId: ctx.event.context.auth?.sessionId,
    },
  })
})

const publicProcedure = t.procedure
const protectedProcedure = t.procedure.use(isAuthenticated)

export { createContext, trpcMiddleware, trpcRouter, publicProcedure, protectedProcedure }
