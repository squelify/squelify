import { CompletionContext, CompletionResult } from '@codemirror/autocomplete'
import type { CompletionSuggestion, CompletionType, SQLContextData } from '../../types'
import { pgsqlKeywords } from './keywords'

/**
 * PostgreSQL specific context data
 */
export interface PostgreSQLContextData extends SQLContextData {
  /** List of database schemas */
  schemas?: string[]

  /** List of installed database extensions */
  extensions?: string[]
}

export function createPostgreSQLCompletions(contextData: PostgreSQLContextData = {}) {
  const { tables = [], columns = {}, schemas = [], extensions = [] } = contextData

  return function pgsqlCompletions(context: CompletionContext): CompletionResult | null {
    const word = context.matchBefore(/\w*/)
    if (!word) return null

    const textBefore = context.state.doc.sliceString(0, context.pos)
    const tokens = textBefore.split(/\s+/).filter(Boolean)
    const lastToken = tokens[tokens.length - 1]?.toUpperCase()
    const prevToken = tokens[tokens.length - 2]?.toUpperCase()

    let options: CompletionSuggestion[] = []

    // Schema-aware completions
    if (lastToken === 'SCHEMA') {
      options = schemas.map((schema) => ({
        label: schema,
        type: 'schema' as CompletionType,
        info: `Schema: ${schema}`,
        boost: 100,
        section: 'Schemas',
      }))
    }

    // Extension management
    else if (prevToken === 'CREATE' && lastToken === 'EXTENSION') {
      options = extensions.map((ext) => ({
        label: ext,
        type: 'extension' as CompletionType,
        info: `Extension: ${ext}`,
        boost: 100,
        section: 'Extensions',
      }))
    }

    // DDL Statements
    else if (lastToken === 'CREATE') {
      options = pgsqlKeywords.ddl.map((kw) => ({
        label: kw.label,
        type: kw.type as CompletionType,
        info: kw.info,
        template: kw.template,
        boost: 95,
        section: 'DDL Statements',
      }))
    }

    // IF NOT EXISTS Suggestions after CREATE TABLE, CREATE INDEX, CREATE TRIGGER
    else if (
      prevToken === 'CREATE' &&
      (lastToken === 'TABLE' ||
        lastToken === 'INDEX' ||
        lastToken === 'VIEW' ||
        lastToken === 'MATERIALIZED' ||
        lastToken === 'FUNCTION' ||
        lastToken === 'PROCEDURE' ||
        lastToken === 'TRIGGER' ||
        lastToken === 'SCHEMA' ||
        lastToken === 'EXTENSION' ||
        lastToken === 'TYPE')
    ) {
      options = [
        {
          label: 'IF NOT EXISTS',
          type: 'keyword' as CompletionType,
          info: 'Conditionally create if not exists',
          boost: 95,
          section: 'Clauses',
        },
      ]
    }

    // DML Statements
    else if (lastToken === 'SELECT') {
      options = [
        {
          label: '*',
          type: 'operator' as CompletionType,
          info: 'Select all columns',
          boost: 100,
          section: 'Operators',
        },
        {
          label: 'DISTINCT',
          type: 'keyword' as CompletionType,
          info: 'Select unique rows',
          boost: 95,
          section: 'Keywords',
        },
        ...Object.values(columns)
          .flat()
          .map((col) => ({
            label: col,
            type: 'column' as CompletionType,
            info: 'Column',
            boost: 90,
            section: 'Columns',
          })),
        ...pgsqlKeywords.functions.map((fn) => ({
          label: fn.label,
          type: fn.type as CompletionType,
          info: fn.info,
          template: fn.template,
          boost: 85,
          section: 'Functions',
        })),
      ]
    }

    // Table suggestions
    else if (lastToken === 'FROM' || lastToken === 'JOIN') {
      options = [
        ...tables.map((table) => ({
          label: table,
          type: 'table' as CompletionType,
          info: `Table: ${table}`,
          boost: 90,
          section: 'Tables',
        })),
        ...pgsqlKeywords.joins.map((join) => ({
          label: join.label,
          type: join.type as CompletionType,
          info: join.info,
          boost: 85,
          section: 'Joins',
        })),
      ]
    }

    // Window Functions
    else if (prevToken === 'OVER' && lastToken === 'PARTITION') {
      const activeTable = tokens[tokens.indexOf('FROM') + 1]
      if (activeTable && columns[activeTable]) {
        options = columns[activeTable].map((col) => ({
          label: col,
          type: 'column' as CompletionType,
          info: `Partition by ${col}`,
          boost: 90,
          section: 'Columns',
        }))
      }
    }

    // ORDER BY suggestions
    else if (prevToken === 'ORDER' && lastToken === 'BY') {
      const activeTable = tokens[tokens.indexOf('FROM') + 1]
      if (activeTable && columns[activeTable]) {
        options = [
          ...columns[activeTable].map((col) => ({
            label: col,
            type: 'column' as CompletionType,
            info: `Order by ${col}`,
            boost: 90,
            section: 'Columns',
          })),
          {
            label: 'ASC NULLS FIRST',
            type: 'keyword' as CompletionType,
            info: 'Ascending order, nulls first',
            boost: 85,
            section: 'Order Direction',
          },
          {
            label: 'DESC NULLS LAST',
            type: 'keyword' as CompletionType,
            info: 'Descending order, nulls last',
            boost: 85,
            section: 'Order Direction',
          },
        ]
      }
    }

    // GROUP BY suggestions
    else if (prevToken === 'GROUP' && lastToken === 'BY') {
      const activeTable = tokens[tokens.indexOf('FROM') + 1]
      if (activeTable && columns[activeTable]) {
        options = columns[activeTable].map((col) => ({
          label: col,
          type: 'column' as CompletionType,
          info: `Group by ${col}`,
          boost: 90,
          section: 'Columns',
        }))
      }
    }

    // Common Table Expressions
    else if (lastToken === 'WITH') {
      options = [
        {
          label: 'RECURSIVE',
          type: 'keyword' as CompletionType,
          info: 'Recursive CTE',
          boost: 90,
          section: 'CTE Keywords',
        },
      ]
    }

    // Default suggestions
    if (options.length === 0) {
      options = [
        ...pgsqlKeywords.ddl.map((kw) => ({
          label: kw.label,
          type: kw.type as CompletionType,
          info: kw.info,
          template: kw.template,
          section: 'DDL',
        })),
        ...pgsqlKeywords.dml.map((kw) => ({
          label: kw.label,
          type: kw.type as CompletionType,
          info: kw.info,
          template: kw.template,
          section: 'DML',
        })),
        ...pgsqlKeywords.clauses.map((clause) => ({
          label: clause.label,
          type: clause.type as CompletionType,
          info: clause.info,
          section: 'Clauses',
        })),
        ...tables.map((table) => ({
          label: table,
          type: 'table' as CompletionType,
          info: `Table: ${table}`,
          section: 'Tables',
        })),
      ]
    }

    return { from: word.from, options, validFor: /^\w*$/ }
  }
}
