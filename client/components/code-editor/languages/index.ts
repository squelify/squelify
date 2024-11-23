import type { EditorLanguage, LanguageDefinition } from '../types'
import { sqliteLanguage } from './sqlite'

export const languages: Record<EditorLanguage, LanguageDefinition> = {
  sqlite: sqliteLanguage,
  json: {
    name: 'JSON',
    extensions: [],
    createCompletions: () => () => null,
    defaultValue: '{\n\n}',
  },
  csv: {
    name: 'CSV',
    extensions: [],
    createCompletions: () => () => null,
    defaultValue: '',
  },
  graphql: {
    name: 'GraphQL',
    extensions: [],
    createCompletions: () => () => null,
    defaultValue: '',
  },
  postgresql: {
    name: 'PostgreSQL',
    extensions: [],
    createCompletions: () => () => null,
    defaultValue: '-- Write your PostgreSQL query here\n',
  },
} as const

export type SupportedLanguage = keyof typeof languages
