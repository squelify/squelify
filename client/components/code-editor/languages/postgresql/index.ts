import { sql } from '@codemirror/lang-sql'
import type { EditorContextData, LanguageDefinition } from '../../types'
import { createPostgreSQLCompletions } from './completions'
import { postgresqlTheme } from './theme'

export const postgresqlLanguage: LanguageDefinition = {
  name: 'PostgreSQL',
  extensions: [sql()],
  createCompletions: (contextData?: EditorContextData) => {
    return createPostgreSQLCompletions(contextData?.language?.postgresql)
  },
  defaultValue: '-- Write your PostgreSQL query here\n',
  theme: postgresqlTheme,
  execution: {
    blockDelimiter: ';',
    supportsExecution: true,
    supportsBlockExecution: true,
  },
  formatter: (code: string) => {
    return code
      .replace(/\s+/g, ' ')
      .replace(/\s*([,;])\s*/g, '$1 ')
      .replace(/\s*([()])\s*/g, ' $1 ')
      .replace(
        /\s*(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|WITH|UNION|INTERSECT|EXCEPT)\s+/gi,
        '\n$1 '
      )
      .replace(/\s*(LEFT|RIGHT|INNER|OUTER|CROSS|FULL)\s+JOIN\s+/gi, '\n  $1 JOIN ')
      .trim()
  },
  validator: (code: string) => {
    const errors = []
    const hasValidSyntax = /^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH)\s+/i.test(
      code.trim()
    )

    if (!hasValidSyntax) {
      errors.push({
        message: 'Query must start with valid PostgreSQL command',
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
