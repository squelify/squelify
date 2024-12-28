import type { Kysely } from 'kysely'
import db from '~/database/db.client'
import type { Database } from '~/database/db.schema'

export default defineEventHandler((event) => {
  event.context.db = db
})

declare module 'h3' {
  interface H3EventContext {
    db: Kysely<Database>
  }
}
