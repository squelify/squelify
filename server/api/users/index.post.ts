import { typeid } from 'typeid-js'
import { z } from 'zod'
import { UserSchema } from '~/database/schemas/user'

// Response interface
export interface ICreateUserResponse {
  user: {
    id: string
    firstName: string
    lastName: string | null
    username: string
    email: string
    avatarUrl: string | null
    locale: string | null
    isActive: boolean
    isBanned: boolean
    bannedUntil: string | null
    lastSignInAt: string | null
    createdAt: string
    updatedAt: string | null
  }
}

export const CreateUserSchema = UserSchema.pick({
  firstName: true,
  lastName: true,
  username: true,
  avatarUrl: true,
  locale: true,
})
  .partial({
    lastName: true,
    username: true,
    avatarUrl: true,
    locale: true,
  })
  .extend({
    email: z.string().email('Invalid email format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain uppercase letter')
      .regex(/[a-z]/, 'Password must contain lowercase letter')
      .regex(/[0-9]/, 'Password must contain number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain special character')
      .optional()
      .nullable(),
  })

export default defineEventHandler(async (event) => {
  const now = Math.floor(Date.now() / 1000)

  try {
    const db = event.context.db
    const body = await requireValidatedBody(event, CreateUserSchema)

    // Check if email already exists
    const existingEmail = await db
      .selectFrom('emails')
      .where('email', '=', body.email)
      .select(['id'])
      .executeTakeFirst()

    if (existingEmail) {
      return createErrorResponse(event, `Email address '${body.email}' is already registered`, 409)
    }

    let username = body.username

    // Generate username if not provided
    if (!username) {
      username = generateUsername(body.email)

      let isUnique = false
      let attempt = 0

      while (!isUnique && attempt < 5) {
        const exists = await db
          .selectFrom('users')
          .where('username', '=', username)
          .select(['id'])
          .executeTakeFirst()

        if (!exists) {
          isUnique = true
        } else {
          username = generateUsername(body.email)
          attempt++
        }
      }

      if (!isUnique) {
        return createErrorResponse(event, 'Failed to generate unique username', 500)
      }
    } else {
      const existingUser = await db
        .selectFrom('users')
        .where('username', '=', username)
        .select(['id'])
        .executeTakeFirst()

      if (existingUser) {
        return createErrorResponse(event, `Username '${username}' is already taken`, 409)
      }
    }

    // Create user and email in transaction
    const result = await db.transaction().execute(async (trx) => {
      // Create user
      const user = await trx
        .insertInto('users')
        .values({
          id: typeid('user').toString(),
          firstName: body.firstName,
          lastName: body.lastName || null,
          username,
          avatarUrl: body.avatarUrl || null,
          locale: body.locale,
          isActive: 1,
          isBanned: 0,
          createdAt: now,
        })
        .returningAll()
        .executeTakeFirst()

      // Create primary email
      await trx
        .insertInto('emails')
        .values({
          id: typeid('eml').toString(),
          userId: user.id,
          email: body.email,
          isPrimary: 1,
          createdAt: now,
        })
        .execute()

      if (body.password) {
        const hashedPassword = await hashPassword(body.password)
        await trx
          .insertInto('passwords')
          .values({
            id: typeid('pwd').toString(),
            userId: user.id,
            hash: hashedPassword,
            algorithm: 'scrypt',
            createdAt: now,
          })
          .execute()
      }

      return {
        ...user,
        email: body.email,
        isActive: Boolean(user.isActive),
        isBanned: Boolean(user.isBanned),
        bannedUntil: toISOString(user.bannedUntil),
        lastSignInAt: toISOString(user.lastSignInAt),
        createdAt: toISOString(user.createdAt),
        updatedAt: toISOString(user.updatedAt),
      }
    })

    return createSuccessResponse<ICreateUserResponse>(event, 'User created successfully', {
      user: result,
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})

defineRouteMeta({
  openAPI: {
    summary: 'Create a user',
    tags: ['User Management'],
  },
})
