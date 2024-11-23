import { CompletionContext, CompletionResult } from '@codemirror/autocomplete'
import { dataTypes, keywords } from './suggestions'
import type { SQLSuggestion } from './types'

export function createSQLCompletions(tables: string[] = []) {
  return function sqlCompletions(context: CompletionContext): CompletionResult | null {
    const word = context.matchBefore(/\w*/)
    if (!word) return null

    const textBefore = context.state.doc.sliceString(0, context.pos)
    const lastWord = textBefore.split(/\s+/).pop()?.toUpperCase()

    // Convert tables to SQLSuggestion format
    const tableCompletions = tables.map((table) => ({
      label: table,
      type: 'table' as const,
      info: `Table: ${table}`,
    }))

    // DDL statement completions
    const ddlCompletions: SQLSuggestion[] = [
      { label: 'TABLE', type: 'keyword', info: 'Create a new table' },
      { label: 'INDEX', type: 'keyword', info: 'Create a new index' },
      { label: 'VIEW', type: 'keyword', info: 'Create a virtual table based on result set' },
      { label: 'TRIGGER', type: 'keyword', info: 'Create a database trigger' },
    ]

    let options: SQLSuggestion[] = []

    // After CREATE
    if (lastWord === 'CREATE') {
      options = ddlCompletions
    }
    // After SELECT
    else if (lastWord === 'SELECT') {
      options = [
        { label: '*', type: 'operator', info: 'Select all columns' },
        { label: 'DISTINCT', type: 'keyword', info: 'Select unique rows' },
        ...keywords.filter((k) => k.label === 'COUNT' || k.label === 'SUM' || k.label === 'AVG'),
      ]
    }
    // After FROM/JOIN/UPDATE/INTO
    else if (['FROM', 'JOIN', 'UPDATE', 'INTO'].includes(lastWord || '')) {
      options = tableCompletions
    }
    // After CREATE TABLE
    else if (textBefore.match(/CREATE\s+TABLE\s*$/i)) {
      options = tableCompletions
    }
    // Inside CREATE TABLE definition
    else if (textBefore.match(/CREATE\s+TABLE\s+\w+\s*\(\s*\w*$/i)) {
      options = dataTypes
    }
    // After WHERE/AND/OR
    else if (textBefore.match(/WHERE|AND|OR\s*$/i)) {
      options = [
        { label: 'EXISTS', type: 'keyword', info: 'Check existence of subquery' },
        { label: 'NOT EXISTS', type: 'keyword', info: 'Check non-existence of subquery' },
        ...tableCompletions,
      ]
    }
    // Default suggestions
    else {
      options = [...keywords, ...tableCompletions, ...dataTypes]
    }

    return {
      from: word.from,
      options: options,
      validFor: /^\w*$/,
    }
  }
}
