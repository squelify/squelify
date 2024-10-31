import type { SelectExpression } from 'kysely'
import db from '~/database/db.client'
import type { Database } from '~/database/db.schema'
import type { UserSelect } from '~/database/schemas/user'

/**
 * Finds a user by their unique identifier.
 */
export async function findUserById<SE extends SelectExpression<Database, 'users'>>(
  id: string,
  cols?: readonly SE[]
): Promise<Partial<UserSelect> | null> {
  try {
    const query = db.selectFrom('users').where('id', '=', id)
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
export async function findUserByEmail(email: string): Promise<Partial<UserSelect> | null> {
  try {
    const result = await db
      .selectFrom('users')
      .innerJoin('emails', 'emails.userId', 'users.id')
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

/**
 * Updates the username of a user in the database.
 */
export async function updateUsername(userId: string, newUsername: string): Promise<UserSelect> {
  const now = Math.floor(Date.now() / 1000)

  try {
    const result = await db
      .updateTable('users')
      .set({
        username: newUsername,
        updatedAt: now,
      })
      .where('id', '=', userId)
      .returningAll()
      .executeTakeFirst()

    if (!result) {
      throw new Error(`User with id ${userId} not found`)
    }

    return result
  } catch (error) {
    logger.error('[app]', `Error updating username for user with id ${userId}:`, error)
    throw new Error(`Failed to update username for user with id ${userId}`)
  }
}
