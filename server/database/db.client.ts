import { createClient } from '@libsql/client'
import { LibsqlDialect } from '@libsql/kysely-libsql'
import { CamelCasePlugin, Kysely, ParseJSONResultsPlugin } from 'kysely'
import type { ErrorLogEvent, KyselyConfig, QueryLogEvent } from 'kysely'
import { makeDirectorySync } from 'make-dir'
import { resolve } from 'pathe'
import { env, process } from 'std-env'
import type { Database } from '~/database/db.schema'
import logger from '~/utils/logger'

/**
 * Configures the Kysely database client with the appropriate dialect and plugins.
 *
 * The configuration is determined based on the `DATABASE_MODE` environment variable:
 * - If `DATABASE_MODE` is 'local', a local SQLite database is used, and the database directory is created if it doesn't exist.
 * - Otherwise, the `DATABASE_URL` and `DATABASE_TOKEN` environment variables are used to connect to a remote database.
 *
 * The configuration includes the following plugins:
 * - `CamelCasePlugin`: Automatically converts column names to camelCase.
 * - `ParseJSONResultsPlugin`: Automatically parses JSON columns.
 *
 * @see https://www.kysely.dev/docs/dialects
 * @see https://github.com/tursodatabase/libsql-client-ts
 * @see https://github.com/tursodatabase/kysely-libsql
 */
export const kyselyConfig: KyselyConfig = {
  dialect: (() => {
    const isLocalMode = env.DATABASE_MODE === 'local'
    const localDbPath = resolve(process.cwd(), '_data/data.sqlite')

    if (isLocalMode) {
      logger.info('Creating local database directory...')
      makeDirectorySync(resolve('_data'), { mode: 0o755 })
    }

    return new LibsqlDialect({
      client: createClient({
        url: isLocalMode ? `file:${localDbPath}` : env.DATABASE_URL,
        authToken: isLocalMode ? undefined : env.DATABASE_TOKEN,
      }) as any /* FIXME */,
    })
  })(),
  plugins: [new CamelCasePlugin(), new ParseJSONResultsPlugin()],
}

// Initialize Kysely instance with logging capabilities
export default new Kysely<Database>({
  ...kyselyConfig,
  log: (event: QueryLogEvent | ErrorLogEvent): void => {
    const isTraceMode = String(env.SQUELIFY_LOG_LEVEL).toLowerCase() === 'trace'

    if (event.level === 'query' && isTraceMode) {
      logger.query('[kysely]', event.query.sql, event.query.parameters)
      return
    }

    if (event.level === 'error') {
      logger.query('[kysely]', event.error)
    }
  },
})
