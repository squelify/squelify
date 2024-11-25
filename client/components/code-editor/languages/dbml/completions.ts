import { CompletionContext, CompletionResult } from '@codemirror/autocomplete'
import type { CompletionSuggestion, CompletionType } from '../../types'
import { dbmlKeywords } from './keywords'

export function createDBMLCompletions() {
  return function dbmlCompletions(context: CompletionContext): CompletionResult | null {
    const word = context.matchBefore(/\w*/)
    if (!word) return null

    const textBefore = context.state.doc.sliceString(0, context.pos)
    const tokens = textBefore.split(/\s+/).filter(Boolean)
    const lastToken = tokens[tokens.length - 1]?.toUpperCase()

    let options: CompletionSuggestion[] = []

    // Keyword Suggestions
    if (
      lastToken === 'PROJECT' ||
      lastToken === 'TABLE' ||
      lastToken === 'ENUM' ||
      lastToken === 'REF' ||
      lastToken === 'INDEXES'
    ) {
      options = dbmlKeywords.keywords.map((kw) => ({
        label: kw.label,
        type: kw.type as CompletionType,
        info: kw.info,
        boost: 100,
        section: 'Keywords',
      }))
    }

    // Data Type Suggestions
    else if (
      lastToken === 'INT' ||
      lastToken === 'VARCHAR' ||
      lastToken === 'BOOLEAN' ||
      lastToken === 'DATETIME' ||
      lastToken === 'FLOAT' ||
      lastToken === 'TEXT'
    ) {
      options = dbmlKeywords.dataTypes.map((type) => ({
        label: type.label,
        type: type.type as CompletionType,
        info: type.info,
        boost: 80,
        section: 'Data Types',
      }))
    }

    // Constraint Suggestions
    else if (
      lastToken === 'PK' ||
      lastToken === 'INCREMENT' ||
      lastToken === 'UNIQUE' ||
      lastToken === 'NOT NULL' ||
      lastToken === 'DEFAULT'
    ) {
      options = dbmlKeywords.constraints.map((constraint) => ({
        label: constraint.label,
        type: constraint.type as CompletionType,
        info: constraint.info,
        boost: 70,
        section: 'Constraints',
      }))
    }

    // Operator Suggestions
    else if (lastToken === '>' || lastToken === '<' || lastToken === '-') {
      options = dbmlKeywords.operators.map((op) => ({
        label: op.label,
        type: op.type as CompletionType,
        info: op.info,
        boost: 60,
        section: 'Operators',
      }))
    }

    return {
      from: word.from,
      options,
      validFor: /^\w*$/,
    }
  }
}
