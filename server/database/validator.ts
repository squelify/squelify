import { readFileSync } from 'node:fs'
import { sha256 } from '@noble/hashes/sha256'
import { bytesToHex } from '@noble/hashes/utils'

const MAX_FILE_SIZE = 1024 * 1024 // 1MB
const MAX_INDEXES_PER_TABLE = 5
const RESERVED_PREFIX = '_sq_'
const VALID_SQLITE_TYPES = ['TEXT', 'INTEGER', 'REAL', 'BLOB', 'NULL']

// const SQLITE_KEYWORDS = [
//   'ADD', 'ALL', 'ALTER', 'AND', 'AS', 'ASC', 'BETWEEN', 'BY', 'CASE', 'CHECK',
//   'COLUMN', 'CONSTRAINT', 'CREATE', 'DATABASE', 'DEFAULT', 'DELETE', 'DESC',
//   'DISTINCT', 'DROP', 'ELSE', 'END', 'ESCAPE', 'EXISTS', 'FOREIGN', 'FROM',
//   'GROUP', 'HAVING', 'IN', 'INDEX', 'INNER', 'INSERT', 'INTO', 'IS', 'JOIN',
//   'LEFT', 'LIKE', 'LIMIT', 'NOT', 'NULL', 'ON', 'OR', 'ORDER', 'OUTER',
//   'PRIMARY', 'REFERENCES', 'RIGHT', 'SELECT', 'SET', 'TABLE', 'THEN',
//   'TO', 'TRIGGER', 'UNION', 'UNIQUE', 'UPDATE', 'USING', 'VALUES', 'VIEW',
//   'WHERE', 'WITH'
// ]

const SQLITE_KEYWORDS = [
  'ADD',
  'ALL',
  'ALTER',
  'AND',
  'AS',
  'ASC',
  'BETWEEN',
  'BY',
  'CASE',
  'CHECK',
  'COLUMN',
  'CONSTRAINT',
  'CREATE',
  'DATABASE',
  'DEFAULT',
  'DELETE',
  'DESC',
  'DISTINCT',
  'DROP',
  'ELSE',
  'END',
  'ESCAPE',
  'EXISTS',
  'FOREIGN',
  'FROM',
  'GROUP',
  'HAVING',
  'IN',
  'INDEX',
  'INNER',
  'INSERT',
  'INTO',
  'IS',
  'JOIN',
  'LEFT',
  'LIKE',
  'LIMIT',
  'NOT',
  'NULL',
  'ON',
  'OR',
  'ORDER',
  'OUTER',
  'PRIMARY',
  'REFERENCES',
  'RIGHT',
  'SELECT',
  'SET',
  'TABLE',
  'THEN',
  'TO',
  'TRIGGER',
  'UNION',
  'UNIQUE',
  'UPDATE',
  'USING',
  'VALUES',
  'VIEW',
  'WHERE',
  'WITH',
]

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  checksum: string
}

export function validateMigration(filePath: string): ValidationResult {
  const content = readFileSync(filePath, 'utf-8')
  const errors: string[] = []
  const warnings: string[] = []

  // File size check
  if (Buffer.byteLength(content) > MAX_FILE_SIZE) {
    errors.push(`File size exceeds ${MAX_FILE_SIZE} bytes limit`)
  }

  // Generate checksum using noble/hashes
  const checksum = bytesToHex(sha256(content))

  // Parse SQL statements
  const statements = content.split(';').filter((s) => s.trim())

  for (const stmt of statements) {
    // Check reserved prefix
    if (hasReservedPrefix(stmt)) {
      errors.push(`Statement contains reserved prefix: ${RESERVED_PREFIX}`)
    }

    // Validate SQLite syntax
    if (!isValidSQLiteSyntax(stmt)) {
      errors.push(`Invalid SQLite syntax: ${stmt.substring(0, 100)}...`)
    }

    // Check foreign keys
    validateForeignKeys(stmt, errors, warnings)

    // Check column names
    validateColumnNames(stmt, errors, warnings)

    // Check data types
    validateDataTypes(stmt, errors, warnings)

    // Check constraints
    validateConstraints(stmt, errors, warnings)

    // Check indexes
    validateIndexes(stmt, errors, warnings)

    // Check temporary tables
    if (hasTemporaryTables(stmt)) {
      warnings.push('Usage of temporary tables detected')
    }

    // Check recursive queries
    if (hasRecursiveQueries(stmt)) {
      warnings.push('Usage of recursive queries detected')
    }

    // Validate view definitions
    validateViews(stmt, errors, warnings)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    checksum,
  }
}

function isValidSQLiteSyntax(stmt: string): boolean {
  try {
    // Check basic SQL syntax patterns
    const hasValidCreate = /CREATE\s+(TABLE|INDEX|TRIGGER|VIEW)/i.test(stmt)
    const hasValidAlter = /ALTER\s+TABLE/i.test(stmt)
    const hasValidDrop = /DROP\s+(TABLE|INDEX|TRIGGER|VIEW)/i.test(stmt)
    const hasValidSelect = /SELECT\s+.+\s+FROM/i.test(stmt)
    const hasValidInsert = /INSERT\s+INTO/i.test(stmt)
    const hasValidUpdate = /UPDATE\s+.+\s+SET/i.test(stmt)
    const hasValidDelete = /DELETE\s+FROM/i.test(stmt)
    const hasValidTriggerEnd = /END(?:\s*;)?$/i.test(stmt.trim())

    return (
      hasValidCreate ||
      hasValidAlter ||
      hasValidDrop ||
      hasValidSelect ||
      hasValidInsert ||
      hasValidUpdate ||
      hasValidDelete ||
      hasValidTriggerEnd
    )
  } catch {
    return false
  }
}

function validateForeignKeys(stmt: string, errors: string[], warnings: string[]) {
  const fkRegex = /FOREIGN\s+KEY\s*\((.*?)\)\s*REFERENCES\s+(\w+)\s*\((.*?)\)/gi
  let match: RegExpExecArray | null

  while ((match = fkRegex.exec(stmt)) !== null) {
    const [_, columns, targetTable, targetColumns] = match

    // Check if referenced table exists
    if (targetTable.startsWith(RESERVED_PREFIX)) {
      errors.push(`Foreign key references reserved table: ${targetTable}`)
    }

    // Validate column count matches
    const sourceColCount = columns.split(',').length
    const targetColCount = targetColumns.split(',').length
    if (sourceColCount !== targetColCount) {
      errors.push(`Foreign key column count mismatch: ${columns} -> ${targetColumns}`)
    }

    // Check for ON DELETE/UPDATE clauses
    const hasReferentialAction =
      /(ON\s+DELETE|ON\s+UPDATE)\s+(SET\s+NULL|SET\s+DEFAULT|CASCADE|RESTRICT|NO\s+ACTION)/i.test(
        stmt
      )
    if (!hasReferentialAction) {
      warnings.push(`Foreign key missing ON DELETE/UPDATE clause: ${columns} -> ${targetTable}`)
    }
  }
}

function validateColumnNames(stmt: string, errors: string[], warnings: string[]) {
  const columnDefRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\((.*?)\)/gis
  let match: RegExpExecArray | null

  while ((match = columnDefRegex.exec(stmt)) !== null) {
    const columnDefs = match[2].split(',')

    for (const colDef of columnDefs) {
      const colMatch = colDef.trim().match(/^(\w+)\s+([^()\s]+)/)
      if (!colMatch) continue

      const columnName = colMatch[1]

      // Skip if it's a constraint or table-level definition
      if (
        ['CONSTRAINT', 'PRIMARY', 'FOREIGN', 'UNIQUE', 'CHECK'].includes(columnName.toUpperCase())
      ) {
        continue
      }

      // Check for SQLite keywords usage
      if (SQLITE_KEYWORDS.includes(columnName.toUpperCase())) {
        warnings.push(`Column name uses SQLite keyword: ${columnName}`)
      }

      // Check naming convention
      if (!/^[a-z][a-z0-9_]*$/i.test(columnName)) {
        errors.push(`Invalid column name format: ${columnName}`)
      }

      // Check length
      if (columnName.length > 63) {
        warnings.push(`Column name exceeds 63 characters: ${columnName}`)
      }
    }
  }
}

function validateDataTypes(stmt: string, errors: string[], warnings: string[]) {
  const columnDefRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\((.*?)\)/gis
  let match: RegExpExecArray | null

  while ((match = columnDefRegex.exec(stmt)) !== null) {
    const columnDefs = match[2].split(',')

    for (const colDef of columnDefs) {
      const colMatch = colDef.trim().match(/^(\w+)\s+([^()\s]+)/)
      if (!colMatch) continue

      const dataType = colMatch[2].toUpperCase()
      const baseType = dataType.split(' ')[0]

      // Skip constraints and table-level definitions
      if (['CONSTRAINT', 'PRIMARY', 'FOREIGN', 'UNIQUE', 'CHECK'].includes(baseType)) {
        continue
      }

      if (!VALID_SQLITE_TYPES.includes(baseType)) {
        errors.push(`Invalid SQLite data type: ${dataType}`)
      }

      // Check TEXT/BLOB with size constraints
      if ((baseType === 'TEXT' || baseType === 'BLOB') && colDef.includes('(')) {
        warnings.push(`${baseType} type does not support size constraints: ${colDef.trim()}`)
      }
    }
  }
}

function validateConstraints(stmt: string, errors: string[], warnings: string[]) {
  const constraintRegex = /CONSTRAINT\s+(\w+)\s+([^,\s]+)/gi
  let match: RegExpExecArray | null

  while ((match = constraintRegex.exec(stmt)) !== null) {
    const [_, name, type] = match

    // Check constraint naming
    if (name.startsWith(RESERVED_PREFIX)) {
      errors.push(`Constraint name uses reserved prefix: ${name}`)
    }

    // Validate constraint type
    const validTypes = ['PRIMARY', 'UNIQUE', 'CHECK', 'FOREIGN']
    if (!validTypes.some((t) => type.toUpperCase().includes(t))) {
      errors.push(`Invalid constraint type: ${type}`)
    }

    // Check naming convention
    if (!/^[a-z][a-z0-9_]*$/i.test(name)) {
      errors.push(`Invalid constraint name format: ${name}`)
    }

    // Check constraint name length
    if (name.length > 63) {
      warnings.push(`Constraint name exceeds 63 characters: ${name}`)
    }

    // Check for potentially redundant constraints
    if (stmt.toLowerCase().includes(`constraint ${name.toLowerCase()}`)) {
      warnings.push(`Potentially redundant constraint definition: ${name}`)
    }
  }
}

function validateIndexes(stmt: string, errors: string[], warnings: string[]) {
  const createIndexRegex =
    /CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s+ON\s+(\w+)\s*\((.*?)\)/gi
  const indexes = new Map<string, number>()
  let match: RegExpExecArray | null

  while ((match = createIndexRegex.exec(stmt)) !== null) {
    const [_, indexName, tableName, columns] = match

    // Check index naming
    if (indexName.startsWith(RESERVED_PREFIX)) {
      errors.push(`Index name uses reserved prefix: ${indexName}`)
    }

    // Track indexes per table
    const count = (indexes.get(tableName) || 0) + 1
    indexes.set(tableName, count)

    if (count > MAX_INDEXES_PER_TABLE) {
      warnings.push(`Table ${tableName} has more than ${MAX_INDEXES_PER_TABLE} indexes`)
    }

    // Check column count in index
    const columnCount = columns.split(',').length
    if (columnCount > 3) {
      warnings.push(`Index ${indexName} includes more than 3 columns`)
    }

    // Check naming convention
    if (!/^[a-z][a-z0-9_]*$/i.test(indexName)) {
      errors.push(`Invalid index name format: ${indexName}`)
    }
  }
}

function hasTemporaryTables(stmt: string): boolean {
  return /CREATE\s+TEMPORARY\s+TABLE/i.test(stmt)
}

function hasRecursiveQueries(stmt: string): boolean {
  return /WITH\s+RECURSIVE/i.test(stmt)
}

function validateViews(stmt: string, errors: string[], warnings: string[]) {
  const viewRegex = /CREATE\s+(?:TEMP\s+)?VIEW\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s+AS\s+(.*)/gi
  let match: RegExpExecArray | null

  while ((match = viewRegex.exec(stmt)) !== null) {
    const [_, viewName, definition] = match

    // Check view naming
    if (viewName.startsWith(RESERVED_PREFIX)) {
      errors.push(`View name uses reserved prefix: ${viewName}`)
    }

    // Check naming convention
    if (!/^[a-z][a-z0-9_]*$/i.test(viewName)) {
      errors.push(`Invalid view name format: ${viewName}`)
    }

    // Check for recursive CTEs in view
    if (hasRecursiveQueries(definition)) {
      errors.push(`View ${viewName} contains recursive queries`)
    }

    // Check for temporary tables in view
    if (hasTemporaryTables(definition)) {
      errors.push(`View ${viewName} references temporary tables`)
    }

    // Check for subqueries depth
    const subqueryDepth = (definition.match(/\bSELECT\b/gi) || []).length
    if (subqueryDepth > 3) {
      warnings.push(`View ${viewName} has deep nesting (${subqueryDepth} levels)`)
    }
  }
}

function hasReservedPrefix(stmt: string): boolean {
  const identifierRegex = /(?:TABLE|INDEX|TRIGGER|VIEW|FUNCTION)\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/gi
  let match: RegExpExecArray | null

  while ((match = identifierRegex.exec(stmt)) !== null) {
    if (match[1].toLowerCase().startsWith(RESERVED_PREFIX)) {
      return true
    }
  }
  return false
}
