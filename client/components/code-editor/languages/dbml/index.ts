import { LanguageSupport, StreamLanguage } from '@codemirror/language'
import type { LanguageDefinition } from '../../types'
import { createDBMLCompletions } from './completions'
import dbmlTheme from './theme'

// Define a simple mode using StreamLanguage
const dbmlMode = StreamLanguage.define({
  token(stream) {
    if (stream.match(/^(Project|Table|Ref|Enum|Indexes)\b/)) return 'keyword'
    if (stream.match(/^(Int|Varchar|Boolean|DateTime|Float|Text)\b/)) return 'type'
    if (stream.match(/\b(pk|increment|unique|not null|default)\b/)) return 'attributeName'
    if (stream.match(/\[.*?\]/)) return 'bracket' // Match content inside brackets
    if (stream.match(/\/\/.*/)) return 'comment'
    if (stream.match(/[{}(),;]/)) return 'punctuation'
    if (stream.match(/[-<>]/)) return 'operator'
    if (stream.match(/^[a-zA-Z_][\w]*/)) return 'variableName' // Match table and column names
    stream.next()
    return null
  },
})

export const dbmlLanguage: LanguageDefinition = {
  name: 'DBML',
  extensions: [new LanguageSupport(dbmlMode)],
  createCompletions: () => createDBMLCompletions(),
  defaultValue: 'Table users {\n  id Int [pk, increment]\n  name Varchar\n}\n',
  theme: dbmlTheme,
  execution: {
    supportsExecution: false,
    supportsBlockExecution: false,
  },
  formatter: (code: string) => {
    // Simple formatter for DBML
    return code
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
  },
  validator: (code: string) => {
    // Basic validation logic
    const isValid = code.includes('Table')
    return {
      isValid,
      errors: isValid ? [] : [{ message: 'DBML must include at least one Table definition.' }],
    }
  },
}

export * from './completions'
export * from './theme'
