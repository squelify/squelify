import type { Kysely, SelectExpression } from 'kysely'
import type { Database } from '~/database/db.schema'
import type { User, UserInsert } from '~/database/schemas/user'

export default function createUserRepository(db: Kysely<Database>) {
  return {
    findMany: async (): Promise<User[]> => {
      return await db.selectFrom('_sq_users').selectAll().execute()
    },

    findById: async <SE extends SelectExpression<Database, '_sq_users'>>(
      id: string,
      cols?: readonly SE[]
    ): Promise<Partial<User> | undefined> => {
      try {
        const query = db.selectFrom('_sq_users').where('id', '=', id)
        const result = cols
          ? await query.select(cols).executeTakeFirst()
          : await query.selectAll().executeTakeFirst()

        return result || undefined
      } catch (error) {
        logger.error('[app]', `Error finding user with id ${id}:`, error)
        throw new Error(`Failed to find user with id ${id}`)
      }
    },
    findByEmail: async (email: string): Promise<Partial<User> | undefined> => {
      try {
        const result = await db
          .selectFrom('_sq_users as users')
          .innerJoin('_sq_emails as emails', 'emails.userId', 'users.id')
          .where('emails.email', '=', email)
          .where('emails.isPrimary', '=', 1)
          .where('users.isActive', '=', 1)
          .select(['users.id', 'users.firstName', 'users.lastName', 'emails.email'])
          .executeTakeFirst()

        return result || undefined
      } catch (error) {
        logger.error('[app]', `Error finding user with email ${email}:`, error)
        throw new Error(`Failed to find user with email ${email}`)
      }
    },
    findActive: async (username: string) => {
      return db
        .selectFrom('_sq_users')
        .select(['id', 'username', 'firstName', 'lastName', 'isActive'])
        .where('username', '=', username)
        .where('isActive', '=', 1)
        .where('deletedAt', 'is', null)
        .executeTakeFirst()
    },

    create: async (data: UserInsert): Promise<User> => {
      const result = await db.insertInto('_sq_users').values(data).returningAll().executeTakeFirst()
      if (!result) {
        throw new Error('Failed to create user')
      }
      return result
    },
  }
}
