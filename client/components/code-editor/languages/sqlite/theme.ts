import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

const sqliteHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#007ACC' },
  { tag: t.function(t.variableName), color: '#DD4A68' },
  { tag: t.string, color: '#4B9052' },
  { tag: t.number, color: '#098658' },
  { tag: t.bool, color: '#098658' },
  { tag: t.null, color: '#098658' },
  { tag: t.operator, color: '#007ACC' },
  { tag: t.typeName, color: '#267F99' },
  { tag: t.propertyName, color: '#267F99' },
  { tag: t.comment, color: '#737373', fontStyle: 'italic' },
  { tag: t.variableName, color: '#001080' },
  { tag: t.punctuation, color: '#000000' },
  { tag: t.bracket, color: '#000000' },
  { tag: t.special(t.string), color: '#4B9052' },
])

export const sqliteTheme = [
  syntaxHighlighting(sqliteHighlightStyle),
  EditorView.theme({
    '&': {
      fontSize: '14px',
      fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, monospace',
    },
    '.cm-content': {
      caretColor: '#007ACC',
    },
    '.cm-cursor': {
      borderLeftColor: '#007ACC',
    },
    '.cm-selectionBackground': {
      backgroundColor: '#ADD6FF',
    },
    '.cm-activeLine': {
      backgroundColor: '#F8F9FA',
    },
    '.cm-gutters': {
      backgroundColor: '#F8F9FA',
      borderRight: '1px solid #E4E4E4',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#F0F0F0',
    },
  }),
]
