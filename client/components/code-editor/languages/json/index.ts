import { json } from '@codemirror/lang-json'
import type { EditorContextData, LanguageDefinition } from '../../types'
import { createJSONCompletions } from './completions'
import jsonTheme from './theme'

export const jsonLanguage: LanguageDefinition = {
  name: 'JSON',
  extensions: [json()],
  createCompletions: (contextData?: EditorContextData) => {
    return createJSONCompletions(contextData)
  },
  defaultValue: '{\n\n}',
  theme: jsonTheme,
  execution: {
    supportsExecution: false,
    supportsBlockExecution: false,
  },
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
      return {
        isValid: true,
        errors: [],
      }
    } catch (e) {
      if (e instanceof Error) {
        return {
          isValid: false,
          errors: [
            {
              message: e.message,
              position: {
                line: Number.parseInt(e.message.match(/line (\d+)/)?.[1] || '1'),
                column: Number.parseInt(e.message.match(/column (\d+)/)?.[1] || '1'),
              },
            },
          ],
        }
      }
      return {
        isValid: false,
        errors: [
          {
            message: 'An unknown error occurred',
            position: {
              line: 1,
              column: 1,
            },
          },
        ],
      }
    }
  },
}

export * from './completions'
export * from './theme'
