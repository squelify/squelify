import type { SelectExpression } from 'kysely'
import db from '~/database/db.client'
import type { Database } from '~/database/db.schema'
import type { User } from '~/database/schemas/user'

/**
 * Finds a user by their unique identifier.
 */
export async function findUserById<SE extends SelectExpression<Database, 'sq_users'>>(
  id: string,
  cols?: readonly SE[]
): Promise<Partial<User> | null> {
  try {
    const query = db.selectFrom('sq_users').where('id', '=', id)
    const result = cols
      ? await query.select(cols).executeTakeFirst()
      : await query.selectAll().executeTakeFirst()

    return result || null
  } catch (error) {
    logger.error('[app]', `Error finding user with id ${id}:`, error)
    throw new Error(`Failed to find user with id ${id}`)
  }
}

/**
 * Finds a user by their email address.
 */
export async function findUserByEmail(email: string): Promise<Partial<User> | null> {
  try {
    const result = await db
      .selectFrom('sq_users as users')
      .innerJoin('sq_emails as emails', 'emails.userId', 'users.id')
      .where('emails.email', '=', email)
      .where('emails.isPrimary', '=', 1)
      .where('users.isActive', '=', 1)
      .select(['users.id', 'users.firstName', 'users.lastName', 'emails.email'])
      .executeTakeFirst()

    return result || null
  } catch (error) {
    logger.error('[app]', `Error finding user with email ${email}:`, error)
    throw new Error(`Failed to find user with email ${email}`)
  }
}

export async function findActiveUser(username: string) {
  return db
    .selectFrom('sq_users')
    .select(['id', 'username', 'firstName', 'lastName', 'isActive'])
    .where('username', '=', username)
    .where('isActive', '=', 1)
    .where('deletedAt', 'is', null)
    .executeTakeFirst()
}
