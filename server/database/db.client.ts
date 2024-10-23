import { LibsqlDialect } from '@libsql/kysely-libsql'
import { CamelCasePlugin, Kysely, ParseJSONResultsPlugin } from 'kysely'
import type { ErrorLogEvent, KyselyConfig, QueryLogEvent } from 'kysely'
import { env, isProduction } from 'std-env'
import type { Database } from '~/database/db.schema'

export const kyselyConfig: KyselyConfig = {
  dialect: new LibsqlDialect({
    url: env.DATABASE_URL,
    authToken: env.DATABASE_TOKEN,
  }),
  plugins: [
    // CamelCasePlugin will converts snake_case identifiers
    // in the database into camelCase in the javascript side.
    new CamelCasePlugin(),
    new ParseJSONResultsPlugin(),
  ],
}

export default new Kysely<Database>({
  ...kyselyConfig,
  log: (event: QueryLogEvent | ErrorLogEvent): void => {
    if (event.level === 'query') {
      // Silent if env not development
      if (isProduction) return
      logger.query('[app]', event.query.sql, event.query.parameters)
    }
    if (event.level === 'error') {
      logger.query('[app]', event.error)
    }
  },
})
