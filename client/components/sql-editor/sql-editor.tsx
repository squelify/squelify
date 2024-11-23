import { autocompletion } from '@codemirror/autocomplete'
import { sql } from '@codemirror/lang-sql'
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { lineNumbers, placeholder } from '@codemirror/view'
import { EditorView, basicSetup } from 'codemirror'
import { useLayoutEffect, useRef } from 'react'

import { createSQLCompletions } from './autocomplete'
import { editorTheme } from './theme'
import type { SQLEditorProps } from './types'

const DEFAULT_VALUE = '-- Write your SQL query here\n'

// Base extensions that do not need to be rendered
const baseExtensions = [
  basicSetup,
  sql(),
  lineNumbers(),
  syntaxHighlighting(defaultHighlightStyle),
  editorTheme,
]

export function SQLEditor({
  value = DEFAULT_VALUE,
  onChange = () => {},
  tables = [],
  readOnly = false,
  placeholder: placeholderText = DEFAULT_VALUE,
}: SQLEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorViewRef = useRef<EditorView>()

  // biome-ignore lint/correctness/useExhaustiveDependencies: only render once
  useLayoutEffect(() => {
    if (!editorRef.current) return

    // Dynamic extensions that need values ​​from props
    const dynamicExtensions = [
      autocompletion({ override: [createSQLCompletions(tables)] }),
      EditorView.editable.of(!readOnly),
      placeholder(placeholderText),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString())
        }
      }),
    ]

    const view = new EditorView({
      doc: value,
      extensions: [...baseExtensions, ...dynamicExtensions],
      parent: editorRef.current,
    })

    editorViewRef.current = view

    return () => {
      view.destroy()
    }
  }, [])

  return (
    <div className="relative size-full">
      <div ref={editorRef} className="absolute inset-0" />
    </div>
  )
}
