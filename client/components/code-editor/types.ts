import { Extension } from '@codemirror/state'

/**
 * Supported editor languages for the code editor.
 */
export type EditorLanguage = 'sqlite' | 'pgsql' | 'json' | 'dbml'

/**
 * Theme options for code editor appearance
 * @typedef {('dark' | 'light' | 'auto')} EditorTheme
 *
 * - 'dark' - Force dark theme
 * - 'light' - Force light theme
 * - 'auto' - Follow system/app theme preference
 */
export type EditorTheme = 'dark' | 'light' | 'auto'

/**
 * Editor context data for code completion and validation
 */
export interface EditorContextData {
  /** List of available database table names */
  tables?: string[]

  /** Map of table names to their column names */
  columns?: Record<string, string[]>

  /** List of available database functions */
  functions?: string[]

  /** List of available data types */
  types?: string[]

  /** List of table constraints */
  constraints?: string[]

  /**
   * Foreign key relationships between tables
   * @example
   * {
   *   "posts": [{
   *     sourceColumn: "user_id",
   *     targetTable: "users",
   *     targetColumn: "id"
   *   }]
   * }
   */
  foreignKeys?: Record<
    string,
    {
      /** Source column containing the foreign key */
      sourceColumn: string
      /** Referenced target table name */
      targetTable: string
      /** Referenced target column name */
      targetColumn: string
    }[]
  >

  /** Map of table names to their indexes */
  indexes?: Record<string, string[]>

  /** List of database schemas (PostgreSQL specific) */
  schemas?: string[]

  /** List of database extensions (PostgreSQL specific) */
  extensions?: string[]

  /** JSON schema for validation and autocompletion */
  jsonSchema?: any

  /** Custom validation rules for JSON content */
  validationRules?: any[]
}

/**
 * Props for the CodeEditor component
 */
export interface CodeEditorProps {
  /** Initial value/content of the editor */
  value?: string

  /** Callback fired when editor content changes */
  onChange?: (value: string) => void

  /** Programming language for syntax highlighting and completion */
  language: EditorLanguage

  /** Whether the editor is in read-only mode */
  readOnly?: boolean

  /** Placeholder text shown when editor is empty */
  placeholder?: string

  /** Callback fired when execute command is triggered */
  onExecute?: (value: string) => void

  /** Context data for code completion and validation */
  contextData?: EditorContextData

  /** Whether code execution is in progress */
  isExecuting?: boolean

  /** Whether to focus the editor on mount */
  autoFocus?: boolean

  /** Theme for the editor */
  theme?: EditorTheme
}

/**
 * Editor instance methods exposed via ref
 */
export interface EditorRef {
  /** Execute current statement at cursor position */
  execute: () => void

  /** Execute all statements in editor */
  executeAll: () => void

  /** Get current editor content */
  getValue: () => string

  /** Set editor content */
  setValue: (value: string) => void

  /** Focus the editor */
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

/**
 * Code completion suggestion item
 */
export interface CompletionSuggestion {
  /** Display text shown in completion list */
  label: string

  /** Type of completion item for syntax highlighting */
  type: CompletionType

  /** Additional information shown in tooltip */
  info: string

  /** Template text to insert when item is selected */
  template?: string

  /** Additional details shown next to label */
  detail?: string

  /** Boost score for sorting suggestions */
  boost?: number

  /** Group/section name for organizing suggestions */
  section?: string
}

/**
 * Language configuration and behavior definition
 */
export interface LanguageDefinition {
  /** Display name of the language */
  name: string

  /** CodeMirror language extensions */
  extensions: any[]

  /** Factory function to create completion provider */
  createCompletions: (contextData?: EditorContextData) => (context: any) => any

  /** Default content when creating new editor */
  defaultValue: string

  /** Theme configuration for light and dark modes */
  theme: {
    light: Extension[]
    dark: Extension[]
  }

  /** Code execution configuration */
  execution?: {
    /** Character that separates multiple statements */
    blockDelimiter?: string
    /** Whether language supports executing statements */
    supportsExecution?: boolean
    /** Whether language supports executing blocks of code */
    supportsBlockExecution?: boolean
  }

  /** Code formatting function */
  formatter?: (code: string) => string

  /** Code validation function */
  validator?: (code: string) => ValidationResult
}

/**
 * Result of code validation
 */
export interface ValidationResult {
  /** Whether the code is valid */
  isValid: boolean

  /** List of validation errors */
  errors: Array<{
    /** Error message */
    message: string

    /** Error position in code */
    position?: {
      /** Line number (1-based) */
      line: number
      /** Column number (1-based) */
      column: number
    }
  }>
}

/**
 * Base context data for SQL databases
 */
export interface SQLContextData {
  /** List of available database table names */
  tables?: string[]

  /** Map of table names to their column names */
  columns?: Record<string, string[]>

  /** Map of foreign key relationships between tables */
  foreignKeys?: Record<
    string,
    {
      sourceColumn: string
      targetTable: string
      targetColumn: string
    }[]
  >

  /** Map of table names to their indexes */
  indexes?: Record<string, string[]>

  /** List of available variables */
  variables?: string[]
}
