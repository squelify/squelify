/**
 * Export Postgres Database schema to SQL file
 *
 * This command exports the current database schema including:
 * - Table definitions (CREATE TABLE statements)
 * - Index definitions (CREATE INDEX statements)
 * - Unique index definitions (CREATE UNIQUE INDEX statements)
 * - Trigger definitions (CREATE TRIGGER statements)
 *
 * Features:
 * - All CREATE statements are made idempotent by adding IF NOT EXISTS
 * - System tables (_migration, _migration_lock, sqlite_sequence) are excluded
 * - Output filename includes UTC timestamp
 * - Includes database version info
 * - Wrapped in transaction with PRAGMA foreign_keys handling
 *
 * Usage:
 *   pnpm -s cmd migrate export
 *   pnpm -s cmd migrate export --output=output.sql
 *   pnpm -s cmd migrate export --verbose
 *   pnpm -s cmd migrate export --help
 */

import { writeFileSync } from 'node:fs'
import { defineCommand, showUsage } from 'citty'
import consola from 'consola'
import { Kysely, sql } from 'kysely'
import { makeDirectory } from 'make-dir'
import { resolve } from 'pathe'
import { kyselyConfig } from '~/database/db.client'

interface DatabaseSchema {
  type: string
  name: string
  sql: string
}

function addIfNotExists(sql: string): string {
  return sql
    .replace(/CREATE TABLE/g, 'CREATE TABLE IF NOT EXISTS')
    .replace(/CREATE INDEX/g, 'CREATE INDEX IF NOT EXISTS')
    .replace(/CREATE UNIQUE INDEX/g, 'CREATE UNIQUE INDEX IF NOT EXISTS')
    .replace(/CREATE TRIGGER/g, 'CREATE TRIGGER IF NOT EXISTS')
}

/**
 * Ensures SQL statement ends with exactly one semicolon
 */
function ensureSemicolon(sql: string): string {
  return sql.trim().replace(/;*$/, ';')
}

/**
 * Get formatted timestamp for filename in UTC
 * Format: YYYYMMDD-HHmmss
 */
function getTimestamp(): string {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  const hours = String(now.getUTCHours()).padStart(2, '0')
  const minutes = String(now.getUTCMinutes()).padStart(2, '0')
  const seconds = String(now.getUTCSeconds()).padStart(2, '0')

  return `${year}${month}${day}-${hours}${minutes}${seconds}`
}

async function getDatabaseVersion(db: Kysely<any>): Promise<string> {
  const { rows } = await sql
    .raw<{ dbVersion: string }>('SELECT sqlite_version() as db_version')
    .execute(db)
  return rows[0].dbVersion
}

/**
 * Get SQL header with metadata information
 */
function getSqlHeader(version: string): string {
  const now = new Date()
  return `--
-- Database version: ${version}
-- Timestamp: ${now.toISOString()}
--
-- Note: All CREATE statements are made idempotent with IF NOT EXISTS
-- System tables are excluded (_migration, _migration_lock, sqlite_sequence)`
}

export default defineCommand({
  meta: {
    name: 'db:export',
    description: 'Export current database schema to SQL file',
  },
  args: {
    output: {
      type: 'string',
      description: 'Output file path',
      default: 'schema.sql',
      required: false,
    },
    verbose: {
      type: 'boolean',
      description: 'Verbose output (default: false)',
      required: false,
      alias: 'v',
    },
    help: {
      type: 'boolean',
      description: 'Print information about the command',
      default: false,
    },
  },
  async setup() {
    await makeDirectory(resolve('sqdata/dump'), { mode: 0o755 })
  },
  async run({ args, cmd }) {
    if (args.help) {
      showUsage(cmd)
      return
    }

    try {
      consola.info('Exporting database schema...')

      const db = new Kysely<any>(kyselyConfig)
      const dbVersion = await getDatabaseVersion(db)

      const result = await db
        .selectFrom('sqlite_schema')
        .select(['type', 'name', 'sql'])
        .where('sql', 'is not', null)
        .where('type', 'in', ['table', 'index']) // 'trigger'
        .where('name', 'not in', ['_migration', '_migration_lock', 'sqlite_sequence'])
        .orderBy('rootpage', 'asc')
        .execute()

      if (result.length === 0) {
        consola.info('No objects to export (empty database)')
        return
      }

      // Group indexes by their table name
      const tableGroups = new Map<string, DatabaseSchema[]>()

      for (const row of result) {
        if (row.type === 'table') {
          tableGroups.set(row.name, [row])
        } else if (row.type === 'index') {
          // Extract table name from index name (assumes format: tablename_idx)
          const tableName = row.name.split('_')[0]
          if (tableGroups.has(tableName)) {
            tableGroups.get(tableName)?.push(row)
          }
        }
      }

      const schema = [
        getSqlHeader(dbVersion),
        ...Array.from(tableGroups.values()).map((group) => {
          const [table, ...indexes] = group
          const statements = [
            `--`,
            `-- Table structure for \`${table.name}\``,
            `--`,
            ensureSemicolon(addIfNotExists(table.sql)),
          ]

          if (indexes.length > 0) {
            statements.push(
              '',
              `--`,
              `-- Indexes for table \`${table.name}\``,
              `--`,
              ...indexes.map((idx) => {
                if (args.verbose) {
                  consola.info(`Processing ${idx.type}: ${idx.name}`)
                }
                return ensureSemicolon(addIfNotExists(idx.sql))
              })
            )
          }

          return statements.join('\n')
        }),
      ].join('\n\n')

      // Add timestamp to filename
      const filename = args.output.replace('.sql', `-${getTimestamp()}.sql`)
      const exportPath = `sqdata/backup/${filename}`
      const outputPath = resolve(process.cwd(), exportPath)
      writeFileSync(outputPath, schema, 'utf-8')

      // Count tables, indexes, and triggers
      const tables = result.filter((row) => row.type === 'table').length
      const indexes = result.filter((row) => row.type === 'index').length
      const triggers = result.filter((row) => row.type === 'trigger').length

      consola.success(`Schema exported to: ${exportPath}`)
      consola.success(
        `Total ${tables} tables, ${indexes} indexes, ${triggers} triggers exported (${result.length} objects)`
      )

      await db.destroy()
    } catch (error) {
      consola.error(error instanceof Error ? error.message : 'Unknown error occurred')
      process.exit(1)
    }
  },
})
