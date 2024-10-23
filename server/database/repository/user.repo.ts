import type { SelectExpression } from 'kysely'
import db from '~/database/db.client'
import type { Database } from '~/database/db.schema'
import type { User } from '~/database/schemas/user'

/**
 * Finds a user by their unique identifier.
 *
 * @param id - The unique identifier of the user to find.
 * @param cols - An optional array of column names to select from the 'users' table.
 * @returns A partial user object if found, or `null` if not found.
 * @throws Error if there was a failure finding the user.
 */
export async function findUserById<SE extends SelectExpression<Database, 'users'>>(
  id: string,
  cols?: readonly SE[]
): Promise<Partial<User> | null> {
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
 *
 * @param email - The email address of the user to find.
 * @param cols - An optional array of column names to select from the 'users' table.
 * @returns A partial user object if found, or `null` if not found.
 * @throws Error if there was a failure finding the user.
 */
export async function findUserByEmail<SE extends SelectExpression<Database, 'users'>>(
  email: string,
  cols?: readonly SE[]
): Promise<Partial<User> | null> {
  try {
    const query = db.selectFrom('users').where('email', '=', email)
    const result = cols
      ? await query.select(cols).executeTakeFirst()
      : await query.selectAll().executeTakeFirst()

    return result || null
  } catch (error) {
    logger.error('[app]', `Error finding user with id ${email}:`, error)
    throw new Error(`Failed to find user with id ${email}`)
  }
}

/**
 * Updates the username of a user in the database.
 *
 * @param userId - The unique identifier of the user to update.
 * @param newUsername - The new username to set for the user.
 * @returns The updated user object.
 * @throws Error if there was a failure updating the username.
 */
export async function updateUsername(userId: string, newUsername: string): Promise<User> {
  try {
    const result = await db
      .updateTable('users')
      .set({ username: newUsername })
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
