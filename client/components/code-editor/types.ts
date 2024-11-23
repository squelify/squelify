export type EditorLanguage = 'sqlite' | 'json' | 'csv' | 'graphql' | 'postgresql'

export interface CodeEditorProps {
  value?: string
  onChange?: (value: string) => void
  language: EditorLanguage
  readOnly?: boolean
  placeholder?: string
  onExecute?: (value: string) => void
  contextData?: Record<string, any>
  isExecuting?: boolean
  autoFocus?: boolean
}

export interface EditorRef {
  execute: () => void
  executeAll: () => void
  getValue: () => string
  setValue: (value: string) => void
  focus: () => void
}

export interface CompletionSuggestion {
  label: string
  type:
    | 'keyword'
    | 'function'
    | 'table'
    | 'column'
    | 'operator'
    | 'type'
    | 'index'
    | 'view'
    | 'trigger'
  info: string
  template?: string
}

export interface LanguageDefinition {
  name: string
  extensions: any[]
  createCompletions: (contextData?: any) => (context: any) => any
  defaultValue: string
  theme?: any
  execution?: {
    blockDelimiter?: string
    supportsExecution?: boolean
    supportsBlockExecution?: boolean
  }
}

export interface SQLiteContextData {
  tables?: string[]
  columns?: Record<string, string[]>
}
