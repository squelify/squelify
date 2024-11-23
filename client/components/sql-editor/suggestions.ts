import type { SQLSuggestion } from './types'

// SQLite specific keywords
export const keywords: SQLSuggestion[] = [
  // DDL Keywords
  { label: 'CREATE', type: 'keyword', info: 'Create a new database object' },
  { label: 'ALTER', type: 'keyword', info: 'Modify an existing database object' },
  { label: 'DROP', type: 'keyword', info: 'Remove a database object' },
  { label: 'RENAME', type: 'keyword', info: 'Rename a database object' },

  // DML Keywords
  { label: 'SELECT', type: 'keyword', info: 'Query data from tables' },
  { label: 'INSERT INTO', type: 'keyword', info: 'Add new records' },
  { label: 'UPDATE', type: 'keyword', info: 'Modify existing records' },
  { label: 'DELETE FROM', type: 'keyword', info: 'Remove records' },
  { label: 'REPLACE INTO', type: 'keyword', info: 'Insert or replace records' },

  // Query Components
  { label: 'FROM', type: 'keyword', info: 'Specify source tables' },
  { label: 'WHERE', type: 'keyword', info: 'Filter records' },
  { label: 'GROUP BY', type: 'keyword', info: 'Group rows' },
  { label: 'HAVING', type: 'keyword', info: 'Filter grouped records' },
  { label: 'ORDER BY', type: 'keyword', info: 'Sort results' },
  { label: 'LIMIT', type: 'keyword', info: 'Limit number of rows' },
  { label: 'OFFSET', type: 'keyword', info: 'Skip number of rows' },

  // Joins
  { label: 'JOIN', type: 'keyword', info: 'Combine rows from tables' },
  { label: 'LEFT JOIN', type: 'keyword', info: 'Keep all records from left table' },
  { label: 'INNER JOIN', type: 'keyword', info: 'Keep only matching records' },
  { label: 'CROSS JOIN', type: 'keyword', info: 'Cartesian product of tables' },

  // SQLite Functions
  { label: 'COUNT', type: 'function', info: 'Count rows' },
  { label: 'SUM', type: 'function', info: 'Calculate sum' },
  { label: 'AVG', type: 'function', info: 'Calculate average' },
  { label: 'MIN', type: 'function', info: 'Find minimum value' },
  { label: 'MAX', type: 'function', info: 'Find maximum value' },
  { label: 'COALESCE', type: 'function', info: 'Return first non-null value' },
  { label: 'IFNULL', type: 'function', info: 'Handle null values' },
  { label: 'RANDOM', type: 'function', info: 'Generate random value' },
  { label: 'DATE', type: 'function', info: 'Date operations' },
  { label: 'DATETIME', type: 'function', info: 'DateTime operations' },

  // Common Clauses
  { label: 'DISTINCT', type: 'keyword', info: 'Remove duplicates' },
  { label: 'AS', type: 'keyword', info: 'Alias names' },
  { label: 'IN', type: 'keyword', info: 'Multiple value comparison' },
  { label: 'BETWEEN', type: 'keyword', info: 'Range comparison' },
  { label: 'LIKE', type: 'keyword', info: 'Pattern matching' },
  { label: 'IS NULL', type: 'keyword', info: 'Check for null values' },
  { label: 'NOT NULL', type: 'keyword', info: 'Check for non-null values' },
]

// Common SQLite data types
export const dataTypes: SQLSuggestion[] = [
  { label: 'INTEGER', type: 'type', info: 'Whole numbers' },
  { label: 'REAL', type: 'type', info: 'Floating point numbers' },
  { label: 'TEXT', type: 'type', info: 'Text strings' },
  { label: 'BLOB', type: 'type', info: 'Binary data' },
  { label: 'NUMERIC', type: 'type', info: 'Numbers and decimals' },
  { label: 'BOOLEAN', type: 'type', info: 'True/false values' },
  { label: 'DATETIME', type: 'type', info: 'Date and time values' },
]
