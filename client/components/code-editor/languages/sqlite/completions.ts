import { CompletionContext, CompletionResult } from '@codemirror/autocomplete'
import type { CompletionSuggestion, CompletionType, SQLiteContextData } from '../../types'
import { sqliteKeywords } from './keywords'

export function createSQLiteCompletions(contextData: SQLiteContextData = {}) {
  const { tables = [], columns = {} } = contextData

  return function sqliteCompletions(context: CompletionContext): CompletionResult | null {
    const word = context.matchBefore(/\w*/)
    if (!word) return null

    const textBefore = context.state.doc.sliceString(0, context.pos)
    const tokens = textBefore.split(/\s+/).filter(Boolean)
    const lastToken = tokens[tokens.length - 1]?.toUpperCase()
    const prevToken = tokens[tokens.length - 2]?.toUpperCase()

    let options: CompletionSuggestion[] = []

    // DDL Statements
    if (lastToken === 'CREATE') {
      options = sqliteKeywords.ddl.map((kw) => ({
        label: kw.label,
        type: kw.type as CompletionType,
        info: kw.info,
        template: kw.template,
        boost: 100,
        section: 'DDL Statements',
      }))
    }

    // Table Suggestions
    else if (lastToken === 'FROM' || lastToken === 'JOIN') {
      options = tables.map((table) => ({
        label: table,
        type: 'table' as CompletionType,
        info: `Table: ${table}`,
        boost: 90,
        section: 'Tables',
      }))
    }

    // Column Suggestions after SELECT
    else if (lastToken === 'SELECT') {
      const allColumns = Object.values(columns).flat()
      options = [
        {
          label: '*',
          type: 'operator' as CompletionType,
          info: 'Select all columns',
          boost: 100,
          section: 'Operators',
        },
        ...allColumns.map((col) => ({
          label: col,
          type: 'column' as CompletionType,
          info: `Column: ${col}`,
          boost: 80,
          section: 'Columns',
        })),
        ...sqliteKeywords.functions.map((fn) => ({
          label: fn.label,
          type: fn.type as CompletionType,
          info: fn.info,
          template: fn.template,
          boost: 70,
          section: 'Functions',
        })),
      ]
    }

    // Column Suggestions after WHERE
    else if (lastToken === 'WHERE') {
      const activeTable = tokens[tokens.indexOf('FROM') + 1]
      if (activeTable && columns[activeTable]) {
        options = columns[activeTable].map((col) => ({
          label: col,
          type: 'column' as CompletionType,
          info: `Column from ${activeTable}`,
          boost: 90,
          section: 'Columns',
        }))
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
            label: 'ASC',
            type: 'keyword' as CompletionType,
            info: 'Ascending order',
            boost: 85,
            section: 'Order Direction',
          },
          {
            label: 'DESC',
            type: 'keyword' as CompletionType,
            info: 'Descending order',
            boost: 85,
            section: 'Order Direction',
          },
        ]
      }
    }

    // HAVING suggestions
    else if (lastToken === 'HAVING') {
      options = sqliteKeywords.functions.map((fn) => ({
        label: fn.label,
        type: fn.type as CompletionType,
        info: fn.info,
        template: fn.template,
        boost: 90,
        section: 'Aggregate Functions',
      }))
    }

    // Default Suggestions
    if (options.length === 0) {
      options = [
        ...sqliteKeywords.ddl.map((kw) => ({
          label: kw.label,
          type: kw.type as CompletionType,
          info: kw.info,
          template: kw.template,
          section: 'DDL',
        })),
        ...sqliteKeywords.dml.map((kw) => ({
          label: kw.label,
          type: kw.type as CompletionType,
          info: kw.info,
          template: kw.template,
          section: 'DML',
        })),
        ...sqliteKeywords.functions.map((fn) => ({
          label: fn.label,
          type: fn.type as CompletionType,
          info: fn.info,
          template: fn.template,
          section: 'Functions',
        })),
        ...tables.map((table) => ({
          label: table,
          type: 'table' as CompletionType,
          info: `Table: ${table}`,
          section: 'Tables',
        })),
      ]
    }

    return {
      from: word.from,
      options,
      validFor: /^\w*$/,
    }
  }
}
