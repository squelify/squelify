import { CompletionContext, CompletionResult } from '@codemirror/autocomplete'
import type { CompletionSuggestion, CompletionType } from '../../types'
import { jsonKeywords } from './keywords'

/**
 * JSON specific context data
 */
export interface JSONContextData {
  /** JSON schema for validation and autocompletion */
  schema?: any

  /** Custom validation rules for JSON content */
  validationRules?: any[]
}

export function createJSONCompletions(contextData: JSONContextData = {}) {
  const { schema = {} } = contextData

  return function jsonCompletions(context: CompletionContext): CompletionResult | null {
    const word = context.matchBefore(/\w*/)
    if (!word) return null

    const textBefore = context.state.doc.sliceString(0, context.pos)
    let options: CompletionSuggestion[] = []

    // Property name suggestions
    if (textBefore.match(/"$/)) {
      options = [
        ...jsonKeywords.properties.map((prop) => ({
          label: prop.label,
          type: prop.type as CompletionType,
          info: prop.info,
          boost: 100,
          section: 'Schema Keywords',
        })),
      ]

      // Add schema-based suggestions if available
      if (schema.properties) {
        options = [
          ...options,
          ...Object.keys(schema.properties).map((prop) => ({
            label: prop,
            type: 'property' as CompletionType,
            info: `Property: ${prop}`,
            boost: 90,
            section: 'Schema Properties',
          })),
        ]
      }
    }

    // Value suggestions
    else if (textBefore.match(/:\s*$/)) {
      options = [
        ...jsonKeywords.values.map((val) => ({
          label: val.label,
          type: val.type as CompletionType,
          info: val.info,
          boost: 100,
          section: 'Values',
        })),
        ...jsonKeywords.types.map((type) => ({
          label: type.label,
          type: type.type as CompletionType,
          info: type.info,
          boost: 90,
          section: 'Types',
        })),
      ]

      // Add schema-based value suggestions if available
      if (schema.enum) {
        options = [
          ...options,
          ...schema.enum.map((value) => ({
            label: JSON.stringify(value),
            type: 'value' as CompletionType,
            info: `Enum value: ${value}`,
            boost: 95,
            section: 'Enum Values',
          })),
        ]
      }
    }

    // Constraint suggestions after type definitions
    else if (textBefore.match(/"type"\s*:\s*"(string|number|array)"\s*,\s*$/)) {
      options = jsonKeywords.constraints.map((constraint) => ({
        label: constraint.label,
        type: constraint.type as CompletionType,
        info: constraint.info,
        boost: 100,
        section: 'Constraints',
      }))
    }

    return { from: word.from, options, validFor: /^[\w\d]*$/ }
  }
}
