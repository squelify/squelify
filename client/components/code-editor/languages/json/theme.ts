import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

// Define direct color values for light theme
const lightHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#007acc' }, // Blue for keywords
  { tag: t.string, color: '#008000' }, // Green for strings
  { tag: t.number, color: '#b8860b' }, // Dark goldenrod for numbers
  { tag: t.bool, color: '#b8860b' }, // Dark goldenrod for booleans
  { tag: t.null, color: '#b8860b' }, // Dark goldenrod for null
  { tag: t.propertyName, color: '#007acc' }, // Blue for property names
  { tag: t.punctuation, color: '#6a9955' }, // Muted green for punctuation
  { tag: t.bracket, color: '#6a9955' }, // Muted green for brackets
  { tag: t.comment, color: '#6a9955', fontStyle: 'italic' }, // Muted green for comments
  { tag: t.invalid, color: '#ff0000' }, // Red for invalid
])

// Define direct color values for dark theme
const darkHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#c792ea' }, // Soft purple for keywords
  { tag: t.string, color: '#ecc48d' }, // Soft yellow for strings
  { tag: t.number, color: '#f78c6c' }, // Soft orange for numbers
  { tag: t.bool, color: '#f78c6c' }, // Soft orange for booleans
  { tag: t.null, color: '#f78c6c' }, // Soft orange for null
  { tag: t.propertyName, color: '#82aaff' }, // Light blue for property names
  { tag: t.punctuation, color: '#89ddff' }, // Light cyan for punctuation
  { tag: t.bracket, color: '#89ddff' }, // Light cyan for brackets
  { tag: t.comment, color: '#5c6370', fontStyle: 'italic' }, // Gray for comments
  { tag: t.invalid, color: '#ff5370' }, // Bright pink for invalid
])

export default {
  light: [syntaxHighlighting(lightHighlightStyle)],
  dark: [syntaxHighlighting(darkHighlightStyle)],
}
