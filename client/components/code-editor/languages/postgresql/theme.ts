import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

const postgresqlHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#0077AA' },
  { tag: t.function(t.variableName), color: '#DD4A68' },
  { tag: t.string, color: '#669900' },
  { tag: t.number, color: '#116644' },
  { tag: t.bool, color: '#116644' },
  { tag: t.null, color: '#116644' },
  { tag: t.operator, color: '#0077AA' },
  { tag: t.typeName, color: '#445588' },
  { tag: t.propertyName, color: '#445588' },
  { tag: t.comment, color: '#999999', fontStyle: 'italic' },
  { tag: t.variableName, color: '#336699' },
  { tag: t.punctuation, color: '#999999' },
  { tag: t.bracket, color: '#999999' },
  { tag: t.special(t.string), color: '#669900' },
])

export const postgresqlTheme = [
  syntaxHighlighting(postgresqlHighlightStyle),
  EditorView.theme({
    '&': {
      fontSize: '14px',
      fontFamily: 'monospace',
    },
    '.cm-content': {
      caretColor: '#0077AA',
    },
    '.cm-cursor': {
      borderLeftColor: '#0077AA',
    },
    '.cm-selectionBackground': {
      backgroundColor: '#B3D7FF',
    },
    '.cm-activeLine': {
      backgroundColor: '#F8F9FA',
    },
  }),
]
