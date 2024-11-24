import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

const lightHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: 'hsl(var(--primary))' },
  { tag: t.string, color: 'hsl(var(--success))' },
  { tag: t.number, color: 'hsl(var(--warning))' },
  { tag: t.bool, color: 'hsl(var(--warning))' },
  { tag: t.null, color: 'hsl(var(--warning))' },
  { tag: t.propertyName, color: 'hsl(var(--primary))' },
  { tag: t.punctuation, color: 'hsl(var(--muted-foreground))' },
  { tag: t.bracket, color: 'hsl(var(--muted-foreground))' },
  { tag: t.comment, color: 'hsl(var(--muted-foreground))', fontStyle: 'italic' },
  { tag: t.invalid, color: 'hsl(var(--destructive))' },
])

const darkHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: 'hsl(var(--primary))' },
  { tag: t.string, color: 'hsl(var(--success))' },
  { tag: t.number, color: 'hsl(var(--warning))' },
  { tag: t.bool, color: 'hsl(var(--warning))' },
  { tag: t.null, color: 'hsl(var(--warning))' },
  { tag: t.propertyName, color: 'hsl(var(--primary))' },
  { tag: t.punctuation, color: 'hsl(var(--muted-foreground))' },
  { tag: t.bracket, color: 'hsl(var(--muted-foreground))' },
  { tag: t.comment, color: 'hsl(var(--muted-foreground))', fontStyle: 'italic' },
  { tag: t.invalid, color: 'hsl(var(--destructive))' },
])

export default {
  light: [syntaxHighlighting(lightHighlightStyle)],
  dark: [syntaxHighlighting(darkHighlightStyle)],
}
