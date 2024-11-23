import { CompletionContext, CompletionResult } from '@codemirror/autocomplete'
import { sqliteKeywords } from './suggestions'
import type { SQLSuggestion } from './types'

export function createSQLCompletions(tables: string[] = []) {
  return function sqlCompletions(context: CompletionContext): CompletionResult | null {
    const word = context.matchBefore(/\w*/)
    if (!word) return null

    const textBefore = context.state.doc.sliceString(0, context.pos)
    const lastWord = textBefore.split(/\s+/).pop()?.toUpperCase()

    const tableCompletions = tables.map((table) => ({
      label: table,
      type: 'table' as const,
      info: `Table: ${table}`,
    }))

    let options: SQLSuggestion[] = []

    // DDL Specific Suggestions
    if (lastWord === 'CREATE') {
      options = [...sqliteKeywords.ddl]
    } else if (textBefore.match(/CREATE\s+TABLE\s+$/i)) {
      options = [
        {
          label: 'users',
          type: 'table',
          info: 'Users table template',
          template:
            'users (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  username TEXT NOT NULL,\n  email TEXT UNIQUE,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)',
        },
        {
          label: 'posts',
          type: 'table',
          info: 'Posts table template',
          template:
            'posts (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  title TEXT NOT NULL,\n  content TEXT,\n  user_id INTEGER,\n  FOREIGN KEY (user_id) REFERENCES users (id)\n)',
        },
      ]
    } else if (textBefore.match(/CREATE\s+TABLE\s+\w+\s*\(\s*\w*$/i)) {
      options = [...sqliteKeywords.dataTypes, ...sqliteKeywords.constraints]
    } else if (textBefore.match(/CREATE\s+INDEX\s+$/i)) {
      options = [
        {
          label: 'idx_users_email',
          type: 'index',
          info: 'Index on users.email',
          template: 'idx_users_email ON users (email)',
        },
        {
          label: 'idx_posts_user',
          type: 'index',
          info: 'Index on posts.user_id',
          template: 'idx_posts_user ON posts (user_id)',
        },
      ]
    } else if (textBefore.match(/CREATE\s+VIEW\s+$/i)) {
      options = [
        {
          label: 'vw_user_posts',
          type: 'view',
          info: 'User posts view',
          template:
            'vw_user_posts AS\nSELECT u.username, p.title\nFROM users u\nJOIN posts p ON u.id = p.user_id',
        },
      ]
    } else if (lastWord === 'SELECT') {
      options = [
        { label: '*', type: 'operator', info: 'Select all columns' },
        { label: 'DISTINCT', type: 'keyword', info: 'Select unique rows' },
        ...sqliteKeywords.functions,
      ]
    } else if (['FROM', 'JOIN', 'UPDATE', 'INTO'].includes(lastWord || '')) {
      options = tableCompletions
    } else if (lastWord === 'WHERE') {
      options = [
        { label: 'EXISTS', type: 'keyword', info: 'Subquery exists' },
        { label: 'IN', type: 'keyword', info: 'Value in set' },
        { label: 'LIKE', type: 'keyword', info: 'Pattern matching' },
        { label: 'BETWEEN', type: 'keyword', info: 'Range check' },
      ]
    } else if (textBefore.match(/ALTER\s+TABLE\s+$/i)) {
      options = tableCompletions
    } else if (textBefore.match(/DROP\s+(TABLE|INDEX|VIEW)\s+$/i)) {
      options = tableCompletions
    } else {
      options = [
        ...sqliteKeywords.ddl,
        ...sqliteKeywords.dml,
        ...sqliteKeywords.functions,
        ...tableCompletions,
      ]
    }

    return {
      from: word.from,
      options: options,
      validFor: /^\w*$/,
    }
  }
}
