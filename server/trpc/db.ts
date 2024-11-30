import db from '~/database/db.client'
import type { User, UserInsert } from '~/database/schemas/user'

export const dbService = {
  user: {
    findMany: async (): Promise<User[]> => {
      return await db.selectFrom('sq_users').selectAll().execute()
    },

    findById: async (id: string): Promise<User | undefined> => {
      return await db.selectFrom('sq_users').selectAll().where('id', '=', id).executeTakeFirst()
    },

    create: async (data: UserInsert): Promise<User> => {
      return await db.insertInto('sq_users').values(data).returningAll().executeTakeFirst()
    },
  },
}
