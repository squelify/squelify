export type EditorLanguage = 'sqlite' | 'json' | 'csv' | 'postgresql'

export interface EditorContextData {
  schema?: {
    tables?: string[]
    columns?: Record<string, string[]>
    functions?: string[]
    types?: string[]
    constraints?: string[]
  }
  language?: {
    sqlite?: SQLiteContextData
    postgresql?: PostgreSQLContextData
    json?: JSONContextData
  }
}

export interface CodeEditorProps {
  value?: string
  onChange?: (value: string) => void
  language: EditorLanguage
  readOnly?: boolean
  placeholder?: string
  onExecute?: (value: string) => void
  contextData?: EditorContextData
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

export type CompletionType =
  | 'keyword' // SQL keywords, JSON keywords
  | 'function' // Database functions
  | 'table' // Database tables
  | 'column' // Table columns
  | 'operator' // SQL operators
  | 'type' // Data types
  | 'index' // Database indexes
  | 'view' // Database views
  | 'trigger' // Database triggers
  | 'constraint' // Table constraints
  | 'aggregate' // Aggregate functions
  | 'schema' // Database schemas
  | 'property' // JSON properties
  | 'value' // JSON/SQL values
  | 'bracket' // Brackets/parentheses
  | 'extension' // Database extensions
  | 'parameter' // Query parameters

export interface CompletionSuggestion {
  label: string
  type: CompletionType
  info: string
  template?: string
  detail?: string
  boost?: number
  section?: string
}

export interface LanguageDefinition {
  name: string
  extensions: any[]
  createCompletions: (contextData?: EditorContextData) => (context: any) => any
  defaultValue: string
  theme?: any
  execution?: {
    blockDelimiter?: string
    supportsExecution?: boolean
    supportsBlockExecution?: boolean
  }
  formatter?: (code: string) => string
  validator?: (code: string) => ValidationResult
}

export interface ValidationResult {
  isValid: boolean
  errors: Array<{
    message: string
    position?: { line: number; column: number }
  }>
}

export interface SQLiteContextData {
  tables?: string[]
  columns?: Record<string, string[]>
  foreignKeys?: Record<
    string,
    {
      sourceColumn: string
      targetTable: string
      targetColumn: string
    }[]
  >
  indexes?: Record<string, string[]>
}

export interface PostgreSQLContextData extends SQLiteContextData {
  schemas?: string[]
  extensions?: string[]
}

export interface JSONContextData {
  schema?: any
  validationRules?: any[]
}
