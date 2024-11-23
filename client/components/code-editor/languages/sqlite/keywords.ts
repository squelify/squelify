import type { CompletionSuggestion } from '../../types'

export const sqliteKeywords: Record<string, CompletionSuggestion[]> = {
  ddl: [
    {
      label: 'CREATE TABLE',
      type: 'keyword',
      info: 'Create new table',
      template:
        'CREATE TABLE table_name (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)',
    },
    {
      label: 'CREATE INDEX',
      type: 'keyword',
      info: 'Create new index',
      template: 'CREATE INDEX idx_name ON table_name (column_name)',
    },
    {
      label: 'CREATE UNIQUE INDEX',
      type: 'keyword',
      info: 'Create unique index',
      template: 'CREATE UNIQUE INDEX idx_name ON table_name (column1, column2)',
    },
    {
      label: 'CREATE VIEW',
      type: 'keyword',
      info: 'Create view',
      template:
        'CREATE VIEW view_name AS\nSELECT column1, column2\nFROM table_name\nWHERE condition',
    },
    {
      label: 'CREATE TRIGGER',
      type: 'keyword',
      info: 'Create trigger',
      template:
        'CREATE TRIGGER trigger_name\nAFTER INSERT ON table_name\nFOR EACH ROW\nBEGIN\n  -- trigger logic\nEND',
    },
    {
      label: 'CREATE VIRTUAL TABLE',
      type: 'keyword',
      info: 'Create FTS table',
      template: 'CREATE VIRTUAL TABLE table_name USING fts5(title, body)',
    },
    {
      label: 'ALTER TABLE',
      type: 'keyword',
      info: 'Modify table',
      template: 'ALTER TABLE table_name ADD COLUMN column_name TEXT',
    },
    {
      label: 'DROP TABLE',
      type: 'keyword',
      info: 'Remove table',
      template: 'DROP TABLE table_name',
    },
  ],
  dml: [
    {
      label: 'SELECT',
      type: 'keyword',
      info: 'Query data',
      template: 'SELECT column1, column2\nFROM table_name\nWHERE condition',
    },
    {
      label: 'INSERT INTO',
      type: 'keyword',
      info: 'Insert data',
      template: 'INSERT INTO table_name (column1, column2)\nVALUES (value1, value2)',
    },
    {
      label: 'UPDATE',
      type: 'keyword',
      info: 'Update data',
      template: 'UPDATE table_name\nSET column1 = value1\nWHERE condition',
    },
    {
      label: 'DELETE FROM',
      type: 'keyword',
      info: 'Delete data',
      template: 'DELETE FROM table_name\nWHERE condition',
    },
  ],
  functions: [
    { label: 'COUNT', type: 'function', info: 'Count rows', template: 'COUNT(*)' },
    { label: 'SUM', type: 'function', info: 'Sum values', template: 'SUM(column)' },
    { label: 'AVG', type: 'function', info: 'Average value', template: 'AVG(column)' },
    { label: 'MIN', type: 'function', info: 'Minimum value', template: 'MIN(column)' },
    { label: 'MAX', type: 'function', info: 'Maximum value', template: 'MAX(column)' },
    {
      label: 'GROUP_CONCAT',
      type: 'function',
      info: 'Concatenate values',
      template: 'GROUP_CONCAT(column)',
    },
    {
      label: 'SUBSTR',
      type: 'function',
      info: 'Extract substring',
      template: 'SUBSTR(column, start, length)',
    },
    {
      label: 'REPLACE',
      type: 'function',
      info: 'Replace text',
      template: 'REPLACE(column, find, replace)',
    },
    { label: 'UPPER', type: 'function', info: 'Uppercase', template: 'UPPER(column)' },
    { label: 'LOWER', type: 'function', info: 'Lowercase', template: 'LOWER(column)' },
    { label: 'TRIM', type: 'function', info: 'Remove spaces', template: 'TRIM(column)' },
    { label: 'LENGTH', type: 'function', info: 'String length', template: 'LENGTH(column)' },
    { label: 'DATE', type: 'function', info: 'Get date', template: "DATE('now')" },
    { label: 'DATETIME', type: 'function', info: 'Get datetime', template: "DATETIME('now')" },
    {
      label: 'STRFTIME',
      type: 'function',
      info: 'Format date',
      template: "STRFTIME('%Y-%m-%d', column)",
    },
  ],
  dataTypes: [
    { label: 'INTEGER', type: 'type', info: 'Whole numbers' },
    { label: 'TEXT', type: 'type', info: 'Text strings' },
    { label: 'BLOB', type: 'type', info: 'Binary data' },
    { label: 'REAL', type: 'type', info: 'Floating point numbers' },
    { label: 'NUMERIC', type: 'type', info: 'Decimal numbers' },
    { label: 'BOOLEAN', type: 'type', info: 'True/false values' },
    { label: 'DATETIME', type: 'type', info: 'Date and time values' },
  ],
  constraints: [
    { label: 'PRIMARY KEY', type: 'keyword', info: 'Primary key constraint' },
    { label: 'FOREIGN KEY', type: 'keyword', info: 'Foreign key constraint' },
    { label: 'UNIQUE', type: 'keyword', info: 'Unique constraint' },
    { label: 'NOT NULL', type: 'keyword', info: 'Not null constraint' },
    { label: 'CHECK', type: 'keyword', info: 'Check constraint' },
    { label: 'DEFAULT', type: 'keyword', info: 'Default value' },
  ],
}
