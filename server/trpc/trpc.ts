import { initTRPC } from '@trpc/server'
import type { H3Event } from 'h3'
import type { Kysely } from 'kysely'
import superjson from 'superjson'
import { AppConfig } from '~/app.config'
import { Database } from '~/database/db.schema'

export interface Context {
  event: H3Event
  db: Kysely<Database>
  appConfig: AppConfig
}

export function createContext(event: H3Event): Context {
  return {
    event,
    db: event.context.db,
    appConfig: event.context.appConfig,
  }
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure
