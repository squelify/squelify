import type { CompletionSuggestion } from '../../types'

export const jsonKeywords: Record<string, CompletionSuggestion[]> = {
  properties: [
    { label: 'type', type: 'keyword', info: 'Data type definition' },
    { label: 'properties', type: 'keyword', info: 'Object properties definition' },
    { label: 'required', type: 'keyword', info: 'Required properties list' },
    { label: 'items', type: 'keyword', info: 'Array items definition' },
    { label: 'additionalProperties', type: 'keyword', info: 'Allow additional properties' },
    { label: 'description', type: 'keyword', info: 'Field description' },
    { label: 'default', type: 'keyword', info: 'Default value' },
    { label: 'enum', type: 'keyword', info: 'Enumerated values' },
    { label: 'const', type: 'keyword', info: 'Constant value' },
    { label: 'examples', type: 'keyword', info: 'Example values' },
  ],
  types: [
    { label: 'string', type: 'type', info: 'String type' },
    { label: 'number', type: 'type', info: 'Number type' },
    { label: 'integer', type: 'type', info: 'Integer type' },
    { label: 'boolean', type: 'type', info: 'Boolean type' },
    { label: 'array', type: 'type', info: 'Array type' },
    { label: 'object', type: 'type', info: 'Object type' },
    { label: 'null', type: 'type', info: 'Null type' },
  ],
  values: [
    { label: 'true', type: 'value', info: 'Boolean true' },
    { label: 'false', type: 'value', info: 'Boolean false' },
    { label: 'null', type: 'value', info: 'Null value' },
    { label: '[]', type: 'value', info: 'Empty array' },
    { label: '{}', type: 'value', info: 'Empty object' },
  ],
  constraints: [
    { label: 'minLength', type: 'constraint', info: 'Minimum string length' },
    { label: 'maxLength', type: 'constraint', info: 'Maximum string length' },
    { label: 'pattern', type: 'constraint', info: 'String pattern' },
    { label: 'minimum', type: 'constraint', info: 'Minimum number value' },
    { label: 'maximum', type: 'constraint', info: 'Maximum number value' },
    { label: 'multipleOf', type: 'constraint', info: 'Number multiple of' },
    { label: 'minItems', type: 'constraint', info: 'Minimum array items' },
    { label: 'maxItems', type: 'constraint', info: 'Maximum array items' },
    { label: 'uniqueItems', type: 'constraint', info: 'Unique array items' },
  ],
}
