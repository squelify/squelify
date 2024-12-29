import type { CompletionSuggestion } from '../../types'

export const dbmlKeywords: Record<string, CompletionSuggestion[]> = {
  keywords: [
    { label: 'Project', type: 'keyword', info: 'Define a project' },
    { label: 'Table', type: 'keyword', info: 'Define a new table' },
    { label: 'Enum', type: 'keyword', info: 'Define an enumeration' },
    { label: 'Ref', type: 'keyword', info: 'Define a reference between tables' },
    { label: 'Indexes', type: 'keyword', info: 'Define indexes for a table' },
  ],
  dataTypes: [
    { label: 'Int', type: 'type', info: 'Integer type' },
    { label: 'Varchar', type: 'type', info: 'Variable-length string' },
    { label: 'Boolean', type: 'type', info: 'Boolean type' },
    { label: 'DateTime', type: 'type', info: 'Date and time type' },
    { label: 'Float', type: 'type', info: 'Floating point number' },
    { label: 'Text', type: 'type', info: 'Text type' },
  ],
  constraints: [
    { label: 'pk', type: 'constraint', info: 'Primary key constraint' },
    { label: 'increment', type: 'constraint', info: 'Auto-increment constraint' },
    { label: 'unique', type: 'constraint', info: 'Unique constraint' },
    { label: 'not null', type: 'constraint', info: 'Not null constraint' },
    { label: 'default', type: 'constraint', info: 'Default value constraint' },
  ],
  operators: [
    { label: '>', type: 'operator', info: 'One-to-many relationship' },
    { label: '<', type: 'operator', info: 'Many-to-one relationship' },
    { label: '-', type: 'operator', info: 'One-to-one relationship' },
  ],
}
