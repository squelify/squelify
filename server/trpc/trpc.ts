import { initTRPC } from '@trpc/server'
import type { H3Event } from 'h3'
import superjson from 'superjson'

export interface Context {
  event: H3Event
}

export function createContext(event: H3Event): Context {
  return { event }
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure
