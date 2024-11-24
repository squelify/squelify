import { CodeEditor } from './editor'
import { createLanguageSupport, languages } from './languages'
import type {
  CodeEditorProps,
  CompletionSuggestion,
  EditorContextData,
  EditorLanguage,
  EditorRef,
  LanguageDefinition,
  ValidationResult,
} from './types'

export { CodeEditor, languages, createLanguageSupport }

export type {
  CodeEditorProps,
  EditorRef,
  EditorLanguage,
  EditorContextData,
  CompletionSuggestion,
  LanguageDefinition,
  ValidationResult,
}

export default CodeEditor
