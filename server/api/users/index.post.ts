import { typeid } from 'typeid-js'
import { z } from 'zod'
import { UserSchema } from '~/database/schemas/user'

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
    email: z.string().email('Email tidak valid'),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(/[A-Z]/, 'Password harus mengandung huruf kapital')
      .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
      .regex(/[0-9]/, 'Password harus mengandung angka')
      .regex(/[^A-Za-z0-9]/, 'Password harus mengandung karakter spesial')
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
      setResponseStatus(event, 409)
      return createErrorResponse(409, `Email '${body.email}' sudah terdaftar`)
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
        setResponseStatus(event, 500)
        return createErrorResponse(500, 'Gagal generate username yang unik')
      }
    } else {
      const existingUser = await db
        .selectFrom('users')
        .where('username', '=', username)
        .select(['id'])
        .executeTakeFirst()

      if (existingUser) {
        setResponseStatus(event, 409)
        return createErrorResponse(409, `Username '${username}' sudah digunakan`)
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
          isVerified: 0,
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
            algorithm: 'argon2id',
            createdAt: now,
          })
          .execute()
      }

      return {
        ...user,
        isActive: Boolean(user.isActive),
        isBanned: Boolean(user.isBanned),
        bannedUntil: user.bannedUntil ? new Date(user.bannedUntil * 1000).toISOString() : null,
        lastSignInAt: user.lastSignInAt ? new Date(user.lastSignInAt * 1000).toISOString() : null,
        createdAt: new Date(user.createdAt * 1000).toISOString(),
        updatedAt: user.updatedAt ? new Date(user.updatedAt * 1000).toISOString() : null,
      }
    })

    return {
      status: 200,
      success: true,
      message: 'User berhasil dibuat',
      data: result,
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
