import { createClient } from '@libsql/client'
import { LibsqlDialect } from '@libsql/kysely-libsql'
import consola from 'consola'
import { CamelCasePlugin, Kysely, ParseJSONResultsPlugin } from 'kysely'
import type { ErrorLogEvent, KyselyConfig, QueryLogEvent } from 'kysely'
import { join } from 'pathe'
import { env, isProduction, process } from 'std-env'
import type { Database } from '~/database/db.schema'
import logger from '~/utils/logger'

let dialect: LibsqlDialect

const getDatabaseDialect = () => {
  if (dialect) return dialect

  /* @ref: https://github.com/tursodatabase/libsql-client-ts */
  const libSQLClient = createClient({
    url: env.DATABASE_URL,
    authToken: env.DATABASE_TOKEN,
  })

  return new LibsqlDialect({ client: libSQLClient })
}

// CamelCasePlugin will converts snake_case identifiers
// in the database into camelCase in the javascript side.
export const kyselyConfig: KyselyConfig = {
  dialect: getDatabaseDialect(),
  plugins: [new CamelCasePlugin(), new ParseJSONResultsPlugin()],
}

export default new Kysely<Database>({
  ...kyselyConfig,
  log: (event: QueryLogEvent | ErrorLogEvent): void => {
    if (event.level === 'query') {
      // Silent if env not development
      if (isProduction) return
      logger.query('[app][kysely]', event.query.sql, event.query.parameters)
    }
    if (event.level === 'error') {
      logger.query('[app][kysely]', event.error)
    }
  },
})
