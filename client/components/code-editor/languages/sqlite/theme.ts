import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

const lightHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#007ACC', fontWeight: '600' },
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

const darkHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#569CD6', fontWeight: '600' },
  { tag: t.function(t.variableName), color: '#DCDCAA' },
  { tag: t.string, color: '#CE9178' },
  { tag: t.number, color: '#B5CEA8' },
  { tag: t.bool, color: '#B5CEA8' },
  { tag: t.null, color: '#B5CEA8' },
  { tag: t.operator, color: '#569CD6' },
  { tag: t.typeName, color: '#4EC9B0' },
  { tag: t.propertyName, color: '#4EC9B0' },
  { tag: t.comment, color: '#6A9955', fontStyle: 'italic' },
  { tag: t.variableName, color: '#9CDCFE' },
  { tag: t.punctuation, color: '#D4D4D4' },
  { tag: t.bracket, color: '#D4D4D4' },
  { tag: t.special(t.string), color: '#CE9178' },
])

export default {
  light: [
    syntaxHighlighting(lightHighlightStyle),
    EditorView.theme({
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
    }),
  ],
  dark: [
    syntaxHighlighting(darkHighlightStyle),
    EditorView.theme({
      '.cm-content': {
        caretColor: '#FFFFFF',
      },
      '.cm-cursor': {
        borderLeftColor: '#FFFFFF',
      },
      '.cm-selectionBackground': {
        backgroundColor: '#264F78',
      },
      '.cm-activeLine': {
        backgroundColor: '#1E1E1E',
      },
    }),
  ],
}
