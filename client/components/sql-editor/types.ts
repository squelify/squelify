export interface SQLEditorProps {
  value?: string
  onChange?: (value: string) => void
  tables?: string[]
  readOnly?: boolean
  placeholder?: string
  onExecute?: (query: string) => void
}

export interface SQLSuggestion {
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
