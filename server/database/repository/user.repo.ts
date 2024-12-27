import type { Kysely, SelectExpression } from 'kysely'
import type { Database } from '~/database/db.schema'
import type { User, UserInsert } from '~/database/schemas/user'

export default function createUserRepository(db: Kysely<Database>) {
  return {
    findMany: async (): Promise<User[]> => {
      return await db.selectFrom('users').selectAll().execute()
    },

    findById: async <SE extends SelectExpression<Database, 'users'>>(
      id: string,
      cols?: readonly SE[]
    ): Promise<Partial<User> | null> => {
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
    },

    findByEmail: async (email: string): Promise<Partial<User> | null> => {
      try {
        const result = await db
          .selectFrom('users as u')
          .innerJoin('emails as e', 'e.userId', 'u.id')
          .where('e.email', '=', email)
          .where('e.isPrimary', '=', 1)
          .where('u.isActive', '=', 1)
          .select(['u.id', 'u.firstName', 'u.lastName', 'e.email'])
          .executeTakeFirst()

        return result || null
      } catch (error) {
        logger.error('[app]', `Error finding user with email ${email}:`, error)
        throw new Error(`Failed to find user with email ${email}`)
      }
    },

    findActive: async (username: string) => {
      return db
        .selectFrom('users')
        .select(['id', 'username', 'firstName', 'lastName', 'isActive'])
        .where('username', '=', username)
        .where('isActive', '=', 1)
        .where('deletedAt', 'is', null)
        .executeTakeFirst()
    },

    create: async (data: UserInsert): Promise<User> => {
      const result = await db.insertInto('users').values(data).returningAll().executeTakeFirst()
      if (!result) {
        throw new Error('Failed to create user')
      }
      return result
    },
  }
}
