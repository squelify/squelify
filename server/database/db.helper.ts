import type { ColumnType, CreateTableBuilder, Generated, RawBuilder } from 'kysely'
import { sql } from 'kysely'
import { z } from 'zod'

// Helper to create Zod schema compatible with ColumnType and Generated
// Example: deletedAt: columnType<Date | null>().nullable(),
export const columnType = <T>() => z.custom<ColumnType<T, string | undefined, string | undefined>>()
export const generatedType = <T>() => z.custom<Generated<T>>()

// SQLite-specific function, returns the current Unix timestamp.
export const UNIX_TIMESTAMP = sql.raw(`(strftime('%s', 'now'))`)

// SQLite-specific function, returns the current timestamp in ISO 8601 format.
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
