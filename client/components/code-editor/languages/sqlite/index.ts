import { sql } from '@codemirror/lang-sql'
import type { LanguageDefinition } from '../../types'
import { createSQLiteCompletions } from './completions'
import { sqliteTheme } from './theme'

export const sqliteLanguage: LanguageDefinition = {
  name: 'SQLite',
  extensions: [sql()],
  createCompletions: createSQLiteCompletions,
  defaultValue: '',
  theme: sqliteTheme,
  execution: {
    blockDelimiter: ';',
    supportsExecution: true,
    supportsBlockExecution: true,
  },
}

export * from './completions'
export * from './keywords'
export * from './theme'
