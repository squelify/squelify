import { sql } from '@codemirror/lang-sql'
import type { EditorContextData, LanguageDefinition } from '../../types'
import { createSQLiteCompletions } from './completions'
import { sqliteTheme } from './theme'

export const sqliteLanguage: LanguageDefinition = {
  name: 'SQLite',
  extensions: [sql()],
  createCompletions: (contextData?: EditorContextData) => {
    return createSQLiteCompletions(contextData)
  },
  defaultValue: '',
  theme: sqliteTheme,
  execution: {
    blockDelimiter: ';',
    supportsExecution: true,
    supportsBlockExecution: true,
  },
  formatter: (code: string) => {
    // Basic SQL formatting
    return code
      .replace(/\s+/g, ' ')
      .replace(/\s*([,;])\s*/g, '$1 ')
      .replace(/\s*([()])\s*/g, ' $1 ')
      .replace(/\s*(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING)\s+/gi, '\n$1 ')
      .trim()
  },
  validator: (code: string) => {
    // Basic SQL validation
    const errors = []
    const hasValidSyntax = /^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s+/i.test(code.trim())

    if (!hasValidSyntax) {
      errors.push({
        message: 'Query must start with valid SQL command',
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },
}

export * from './completions'
export * from './keywords'
export * from './theme'
