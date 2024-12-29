import { initTRPC } from '@trpc/server'
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
})

export const trpcRouter = t.router

export const publicProcedure = t.procedure

export { createContext }
