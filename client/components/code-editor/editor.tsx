import * as Lucide from 'lucide-react'
import { forwardRef, useCallback, useEffect, useRef } from 'react'
import { useImperativeHandle, useLayoutEffect } from 'react'

import { autocompletion } from '@codemirror/autocomplete'
import { EditorSelection } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { placeholder } from '@codemirror/view'
import { indentationMarkers } from '@replit/codemirror-indentation-markers'

import { createCoreExtensions } from './extensions/core-extensions'
import { createRunBlockGutter } from './extensions/run-block-gutter'
import { createLanguageSupport } from './languages'
import { getEditorTheme } from './themes/core-theme'
import type { CodeEditorProps, EditorRef } from './types'

export const CodeEditor = forwardRef<EditorRef, CodeEditorProps>(function CodeEditor(
  {
    value = '',
    onChange = () => {},
    language,
    readOnly = false,
    placeholder: placeholderText,
    contextData,
    onExecute,
    isExecuting = false,
    autoFocus = false,
    theme = 'auto',
  },
  ref
) {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorViewRef = useRef<EditorView>()

  const languageSupport = createLanguageSupport(language, contextData)

  // Execute current block based on cursor position
  const executeCurrentBlock = useCallback(() => {
    if (!onExecute || !editorViewRef.current || isExecuting) return false
    if (!languageSupport.execution?.supportsBlockExecution) return false

    const doc = editorViewRef.current.state.doc.toString()
    const cursor = editorViewRef.current.state.selection.main.head
    const delimiter = languageSupport.execution.blockDelimiter || ';'

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
      return true
    }
    return false
  }, [onExecute, languageSupport.execution, isExecuting])

  // Execute all content in editor
  const executeAll = useCallback(() => {
    if (!onExecute || !editorViewRef.current || isExecuting) return false
    if (!languageSupport.execution?.supportsExecution) return false

    const content = editorViewRef.current.state.doc.toString()
    if (content.trim()) {
      onExecute(content)
      return true
    }
    return false
  }, [onExecute, languageSupport.execution, isExecuting])

  // Format code using language-specific formatter
  const formatCode = useCallback(() => {
    if (!editorViewRef.current || !languageSupport.formatter) return

    const content = editorViewRef.current.state.doc.toString()
    const formatted = languageSupport.formatter(content)

    if (formatted !== content) {
      editorViewRef.current.dispatch({
        changes: { from: 0, to: content.length, insert: formatted },
      })
    }
  }, [languageSupport.formatter])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifierPressed = e.metaKey || e.ctrlKey

      if (isModifierPressed) {
        if (e.code === 'Enter') {
          e.preventDefault()
          if (e.shiftKey) {
            executeAll()
          } else {
            executeCurrentBlock()
          }
        } else if (e.code === 'KeyS') {
          e.preventDefault()
          formatCode()
        }
      }
    }

    editorRef.current?.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => {
      editorRef.current?.removeEventListener('keydown', handleKeyDown, { capture: true })
    }
  }, [executeCurrentBlock, executeAll, formatCode])

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'auto') return

    const observer = new MutationObserver(() => {
      if (editorViewRef.current) {
        editorViewRef.current.destroy()
        initializeEditor()
      }
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [theme])

  // Expose editor methods through ref
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
          editorRef.current?.focus()
          editorViewRef.current.focus()
          const pos = editorViewRef.current.state.doc.length
          editorViewRef.current.dispatch({
            selection: EditorSelection.single(pos),
            effects: EditorView.scrollIntoView(pos),
          })
        }
      },
      format: formatCode,
    }),
    [executeCurrentBlock, executeAll, formatCode]
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: initialize editor
  const initializeEditor = useCallback(() => {
    if (!editorRef.current) return

    const effectiveTheme =
      theme === 'auto'
        ? document.documentElement.classList.contains('dark')
          ? 'dark'
          : 'light'
        : theme

    const view = new EditorView({
      doc: value,
      extensions: [
        createCoreExtensions(),
        createRunBlockGutter(onExecute),
        ...languageSupport.extensions,
        autocompletion({
          override: [languageSupport.createCompletions(contextData)],
          defaultKeymap: true,
          maxRenderedOptions: 100,
        }),
        EditorView.editable.of(!readOnly && !isExecuting),
        placeholder(placeholderText),
        getEditorTheme(theme),
        ...(languageSupport.theme[effectiveTheme] || []),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        }),
        // Third-party extensions
        indentationMarkers({
          highlightActiveBlock: true,
          hideFirstIndent: false,
          markerType: 'fullScope',
          activeThickness: 1,
          thickness: 1,
          colors: {
            light: 'hsl(214.3 31.8% 91.4% / 0.5)',
            dark: 'hsl(210 40% 96.1% / 0.2)',
            activeLight: 'hsl(210 40% 96.1% / 0.2)',
            activeDark: 'hsl(214.3 31.8% 91.4% / 0.5)',
          },
        }),
      ],
      parent: editorRef.current,
    })

    editorViewRef.current = view

    if (autoFocus) {
      requestAnimationFrame(() => {
        view.focus()
      })
    }
  }, [onChange, language, readOnly, placeholderText, autoFocus, theme])

  useLayoutEffect(() => {
    initializeEditor()
    return () => editorViewRef.current?.destroy()
  }, [initializeEditor])

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
