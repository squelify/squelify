import type { CreateTableBuilder, RawBuilder } from 'kysely'
import { sql } from 'kysely'

// SQLite-specific function, returns the current Unix timestamp.
export const UNIX_TIMESTAMP = sql.raw(`(strftime('%s', 'now'))`)

// SQLite-specific function, returns the current timestamp in ISO8601 format.
// For zod compatibility, we need to use the ISO8601 format.
// Use this: z.string().datetime({ offset: true })
export const ISO_TIMESTAMP = sql.raw(`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)

export const columnTimestamps = <T extends string, C extends string = never>(
  builder: CreateTableBuilder<T, C>
) => {
  return builder
    .addColumn('created_at', 'text', (col) => col.defaultTo(ISO_TIMESTAMP).notNull())
    .addColumn('updated_at', 'text', (col) => col.defaultTo(ISO_TIMESTAMP).notNull())
}

export const columnSoftDelete = <T extends string, C extends string = never>(
  builder: CreateTableBuilder<T, C>
) => {
  return builder.addColumn('deleted_at', 'text', (col) => col.defaultTo(null))
}

/* @reference: https://www.kysely.dev/docs/recipes/relations */
export function json<T>(value: T): RawBuilder<T> {
  return sql`CAST(${JSON.stringify(value)} AS JSONB)`
}
