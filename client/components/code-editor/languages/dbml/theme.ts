import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

// Define a soft color scheme for light mode
const lightHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#6a5acd' }, // Soft slate blue for keywords
  { tag: t.string, color: '#b8860b' }, // Soft dark goldenrod for strings
  { tag: t.number, color: '#8a2be2' }, // Soft blue violet for numbers
  { tag: t.propertyName, color: '#4682b4' }, // Soft steel blue for property names
  { tag: t.punctuation, color: '#696969' }, // Dim gray for punctuation
  { tag: t.comment, color: '#228b22', fontStyle: 'italic' }, // Forest green for comments
  { tag: t.invalid, color: '#dc143c' }, // Crimson for invalid
  { tag: t.operator, color: '#d2691e' }, // Chocolate for operators
  { tag: t.attributeName, color: '#6a5acd' }, // Soft slate blue for attributes
  { tag: t.variableName, color: '#2e8b57' }, // Sea green for variable names
  { tag: t.typeName, color: '#ff4500' }, // Orange red for type names
  { tag: t.bracket, color: '#696969' }, // Dim gray for brackets
])

// Define a softer color scheme for dark mode
const darkHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#a390f0' }, // Softer lavender for keywords
  { tag: t.string, color: '#f0e68c' }, // Khaki for strings
  { tag: t.number, color: '#d8bfd8' }, // Thistle for numbers
  { tag: t.propertyName, color: '#5f9ea0' }, // Cadet blue for property names
  { tag: t.punctuation, color: '#708090' }, // Slate gray for punctuation
  { tag: t.comment, color: '#77dd77', fontStyle: 'italic' }, // Pastel green for comments
  { tag: t.invalid, color: '#e9967a' }, // Dark salmon for invalid
  { tag: t.operator, color: '#f4a460' }, // Sandy brown for operators
  { tag: t.attributeName, color: '#a390f0' }, // Softer lavender for attributes
  { tag: t.variableName, color: '#f78c6c' }, // Powder blue for variable names
  { tag: t.typeName, color: '#ff7f50' }, // Coral for type names
  { tag: t.bracket, color: '#708090' }, // Slate gray for brackets
])

export default {
  light: [syntaxHighlighting(lightHighlightStyle)],
  dark: [syntaxHighlighting(darkHighlightStyle)],
}
