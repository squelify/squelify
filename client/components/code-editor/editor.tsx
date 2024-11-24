import { autocompletion } from '@codemirror/autocomplete'
import { indentWithTab } from '@codemirror/commands'
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorSelection } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, placeholder } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import * as Lucide from 'lucide-react'
import { forwardRef, useCallback, useEffect, useRef } from 'react'
import { useImperativeHandle, useLayoutEffect } from 'react'
import { languages } from './languages'
import type { CodeEditorProps, EditorRef } from './types'

const baseExtensions = [
  basicSetup,
  lineNumbers(),
  syntaxHighlighting(defaultHighlightStyle),
  keymap.of([indentWithTab]),
]

export const CodeEditor = forwardRef<EditorRef, CodeEditorProps>(function CodeEditor(
  {
    value = '',
    onChange = () => {},
    language,
    readOnly = false,
    placeholder: placeholderText = '-- Write your query here',
    contextData,
    onExecute,
    isExecuting = false,
    autoFocus = false,
  },
  ref
) {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorViewRef = useRef<EditorView>()

  const languageDef = languages[language]

  const executeCurrentBlock = useCallback(() => {
    if (!onExecute || !editorViewRef.current || isExecuting) return false
    if (!languageDef.execution?.supportsBlockExecution) return false

    const doc = editorViewRef.current.state.doc.toString()
    const cursor = editorViewRef.current.state.selection.main.head
    const delimiter = languageDef.execution.blockDelimiter || ';'

    const blocks = doc.split(delimiter)
    let position = 0
    let currentBlock = ''

    for (const block of blocks) {
      const blockLength = block.length + delimiter.length
      if (position <= cursor && cursor <= position + blockLength) {
        currentBlock = block.trim()
        break
      }
      position += blockLength
    }

    if (currentBlock) {
      onExecute(currentBlock)
    }
    return true
  }, [onExecute, languageDef.execution, isExecuting])

  const executeAll = useCallback(() => {
    if (!onExecute || !editorViewRef.current || isExecuting) return false
    if (!languageDef.execution?.supportsExecution) return false

    const content = editorViewRef.current.state.doc.toString()
    onExecute(content)
    return true
  }, [onExecute, languageDef.execution, isExecuting])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifierPressed = e.metaKey || e.ctrlKey

      if (isModifierPressed && e.code === 'Enter') {
        if (!languageDef.execution?.supportsExecution) return

        e.preventDefault()
        if (e.shiftKey) {
          executeAll()
        } else {
          executeCurrentBlock()
        }
      }
    }

    editorRef.current?.addEventListener('keydown', handleKeyDown, { capture: true })

    return () => {
      editorRef.current?.removeEventListener('keydown', handleKeyDown, { capture: true })
    }
  }, [executeCurrentBlock, executeAll, languageDef.execution])

  useImperativeHandle(
    ref,
    () => ({
      execute: executeCurrentBlock,
      executeAll,
      getValue: () => editorViewRef.current?.state.doc.toString() || '',
      setValue: (value: string) => {
        if (editorViewRef.current) {
          const targetRef = editorViewRef.current.state.doc.length
          editorViewRef.current.dispatch({
            changes: { from: 0, to: targetRef, insert: value },
          })
        }
      },
      focus: () => {
        if (editorViewRef.current) {
          // Force focus on editor container first
          editorRef.current?.focus()

          // Then focus the editor view
          editorViewRef.current.focus()

          // Set cursor position and scroll into view
          const pos = editorViewRef.current.state.doc.length
          editorViewRef.current.dispatch({
            selection: EditorSelection.single(pos),
            effects: EditorView.scrollIntoView(pos),
          })
        }
      },
    }),
    [executeCurrentBlock, executeAll]
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: only called once
  useLayoutEffect(() => {
    if (!editorRef.current) return

    const view = new EditorView({
      doc: value,
      extensions: [
        ...baseExtensions,
        ...languageDef.extensions,
        autocompletion({ override: [languageDef.createCompletions(contextData)] }),
        EditorView.editable.of(!readOnly && !isExecuting),
        placeholder(placeholderText),
        languageDef.theme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        }),
      ],
      parent: editorRef.current,
    })

    editorViewRef.current = view

    // Handle autofocus
    if (autoFocus) {
      requestAnimationFrame(() => {
        view.focus()
      })
    }

    return () => {
      view.destroy()
    }
  }, [isExecuting])

  return (
    <div className="relative size-full">
      <div ref={editorRef} className="absolute inset-0" />
      {isExecuting && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
          <Lucide.Loader2 className="size-10 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
})

CodeEditor.displayName = 'CodeEditor'
