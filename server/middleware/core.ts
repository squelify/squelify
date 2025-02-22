import type { Kysely } from 'kysely'
import db from '~/database/db.client'
import type { Database } from '~/database/db.schema'
import type { AppConfig } from '~~/app.config'

export default defineEventHandler((event) => {
  const appConfig = useAppConfig(event) as AppConfig
  event.context.appConfig = appConfig
  event.context.db = db
})

declare module 'h3' {
  interface H3EventContext {
    appConfig: AppConfig
    db: Kysely<Database>
  }
}
