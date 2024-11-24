import type { EditorContextData, EditorLanguage, LanguageDefinition } from '../types'
import { postgresqlLanguage } from './postgresql'
import { sqliteLanguage } from './sqlite'

export const languages: Record<EditorLanguage, LanguageDefinition> = {
  sqlite: sqliteLanguage,
  postgresql: postgresqlLanguage,
  json: {
    name: 'JSON',
    extensions: [],
    createCompletions: () => () => null,
    defaultValue: '{\n\n}',
    formatter: (code: string) => {
      try {
        return JSON.stringify(JSON.parse(code), null, 2)
      } catch {
        return code
      }
    },
    validator: (code: string) => {
      try {
        JSON.parse(code)
        return { isValid: true, errors: [] }
      } catch (e) {
        return {
          isValid: false,
          errors: [{ message: e.message }],
        }
      }
    },
  },
  csv: {
    name: 'CSV',
    extensions: [],
    createCompletions: () => () => null,
    defaultValue: '',
    formatter: (code: string) => code.trim(),
    validator: (code: string) => {
      const lines = code.split('\n')
      const headerCount = lines[0]?.split(',').length || 0
      const errors = []

      for (const [index, line] of lines.entries()) {
        const columnCount = line.split(',').length
        if (columnCount !== headerCount) {
          errors.push({
            message: `Line ${index + 1} has ${columnCount} columns, expected ${headerCount}`,
            position: { line: index + 1, column: 1 },
          })
        }
      }

      return { isValid: errors.length === 0, errors }
    },
  },
} as const

export function createLanguageSupport(language: EditorLanguage, contextData?: EditorContextData) {
  const languageDefinition = languages[language]
  return {
    ...languageDefinition,
    completions: languageDefinition.createCompletions(contextData),
    validate: languageDefinition.validator,
    format: languageDefinition.formatter,
  }
}

export type SupportedLanguage = keyof typeof languages
