/**
 * Configures the Kysely database client with the appropriate dialect and plugins.
 *
 * The configuration includes the following plugins:
 * - `CamelCasePlugin`: Automatically converts column names to camelCase.
 * - `ParseJSONResultsPlugin`: Automatically parses JSON columns.
 *
 * @see https://www.kysely.dev/docs/dialects
 * @see https://github.com/kysely-org/kysely-postgres-js
 */

import { CamelCasePlugin, Kysely, ParseJSONResultsPlugin } from 'kysely'
import type { ErrorLogEvent, KyselyConfig, QueryLogEvent } from 'kysely'
import { PostgresJSDialect } from 'kysely-postgres-js'
import postgres from 'postgres'
import { env } from 'std-env'
import type { Database } from '~/database/db.schema'
import logger from '~/utils/logger'

export const kyselyConfig: KyselyConfig = {
  dialect: new PostgresJSDialect({
    postgres: postgres(String(env.DATABASE_URL)),
  }),
  plugins: [new CamelCasePlugin(), new ParseJSONResultsPlugin()],
}

// Initialize Kysely instance with logging capabilities
export default new Kysely<Database>({
  ...kyselyConfig,
  log: (event: QueryLogEvent | ErrorLogEvent): void => {
    const isTraceMode = String(env.APP_LOG_LEVEL).toLowerCase() === 'trace'

    if (event.level === 'query' && isTraceMode) {
      logger.query('[kysely]', event.query.sql, event.query.parameters)
      return
    }

    if (event.level === 'error') {
      logger.query('[kysely]', event.error)
    }
  },
})
