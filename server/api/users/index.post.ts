import { typeid } from 'typeid-js'
import { z } from 'zod'
import { DEFAULT_PASSWORD_ALGORITHM } from '~/database/schemas/password'
import { UserSchema } from '~/database/schemas/user'

export interface ICreateUserResponse {
  user: {
    id: string
    firstName: string
    lastName: string | null
    username: string
    email: string
    avatarUrl: string | null
    isActive: boolean
    metadata: Record<string, any>
    createdAt: string
    updatedAt: string | null
  }
}

export const CreateUserSchema = UserSchema.pick({
  firstName: true,
  lastName: true,
  username: true,
  avatarUrl: true,
})
  .partial({
    lastName: true,
    username: true,
    avatarUrl: true,
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
      .selectFrom('sq_emails')
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
          .selectFrom('sq_users')
          .where('username', '=', username)
          .where('deletedAt', 'is', null)
          .select(['id'])
          .executeTakeFirst()

        if (!exists) {
          isUnique = true
        } else {
          username = generateUsername(body.email, generateRandomStr({ size: 4 }))
          attempt++
        }
      }

      if (!isUnique) {
        return createErrorResponse(event, 'Failed to generate unique username', 500)
      }
    } else {
      const existingUser = await db
        .selectFrom('sq_users')
        .where('username', '=', username)
        .where('deletedAt', 'is', null)
        .select(['id'])
        .executeTakeFirst()

      if (existingUser) {
        return createErrorResponse(event, `Username '${username}' is already taken`, 409)
      }
    }

    // Create user with initial metadata
    const userId = typeid('user').toString()
    const result = await db.transaction().execute(async (trx) => {
      // Create user
      const user = await trx
        .insertInto('sq_users')
        .values({
          id: userId,
          firstName: body.firstName,
          lastName: body.lastName || null,
          username,
          avatarUrl: body.avatarUrl || null,
          isActive: 1,
          createdAt: now,
        })
        .returningAll()
        .executeTakeFirst()

      // Create primary email
      await trx
        .insertInto('sq_emails')
        .values({
          id: typeid('eml').toString(),
          userId: userId,
          email: body.email,
          isPrimary: 1,
          createdAt: now,
        })
        .execute()

      // Create initial metadata
      await trx
        .insertInto('sq_user_metadata')
        .values({
          id: typeid('meta').toString(),
          userId: userId,
          key: 'registration_date',
          value: String(now),
          isPublic: 1,
          createdAt: now,
        })
        .execute()

      if (body.password) {
        const hashedPassword = await hashPassword(body.password, DEFAULT_PASSWORD_ALGORITHM)
        await trx
          .insertInto('sq_passwords')
          .values({
            id: typeid('pwd').toString(),
            userId: userId,
            hash: hashedPassword,
            algorithm: DEFAULT_PASSWORD_ALGORITHM,
            createdAt: now,
          })
          .execute()
      }

      // Get public metadata
      const metadata = await trx
        .selectFrom('sq_user_metadata')
        .where('userId', '=', userId)
        .where('isPublic', '=', 1)
        .select(['key', 'value'])
        .execute()

      return {
        ...user,
        email: body.email,
        isActive: Boolean(user.isActive),
        metadata: metadata.reduce((acc, { key, value }) => {
          acc[key] = value
          return acc
        }, {}),
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
    summary: 'Create new user',
    tags: ['User Management'],
    parameters: [
      {
        in: 'header',
        name: 'Contennt-Type',
        required: true,
        example: 'application/json',
      },
    ],
    responses: {
      200: { $ref: 'resp-ok' },
      400: { $ref: 'resp-bad-request' },
      500: { $ref: 'resp-internal-server-error' },
    },
  },
})
