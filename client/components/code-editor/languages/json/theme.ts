import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

const jsonHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#0033B3' },
  { tag: t.string, color: '#067D17' },
  { tag: t.number, color: '#1750EB' },
  { tag: t.bool, color: '#0033B3' },
  { tag: t.null, color: '#0033B3' },
  { tag: t.propertyName, color: '#871094' },
  { tag: t.punctuation, color: '#000000' },
  { tag: t.bracket, color: '#000000' },
  { tag: t.comment, color: '#8C8C8C', fontStyle: 'italic' },
  { tag: t.invalid, color: '#FF0000' },
])

export const jsonTheme = [
  syntaxHighlighting(jsonHighlightStyle),
  EditorView.theme({
    '&': {
      fontSize: '14px',
      fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, monospace',
    },
    '.cm-content': {
      caretColor: '#000000',
    },
    '.cm-cursor': {
      borderLeftColor: '#000000',
    },
    '.cm-selectionBackground': {
      backgroundColor: '#BBDFFF',
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
    '.cm-matchingBracket': {
      backgroundColor: '#C9F5FE',
      outline: '1px solid #92E6F6',
    },
  }),
]
