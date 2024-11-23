export interface SQLEditorProps {
  value?: string
  onChange?: (value: string) => void
  tables?: string[]
  readOnly?: boolean
  placeholder?: string
}

export interface SQLSuggestion {
  label: string
  type: string
  info: string
}
