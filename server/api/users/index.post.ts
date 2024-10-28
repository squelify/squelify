import { typeid } from 'typeid-js'
import { z } from 'zod'

const CreateUserSchema = z.object({
  firstName: z.string().min(2, 'Nama depan minimal 2 karakter'),
  lastName: z.string().optional(),
  email: z.string().email('Email tidak valid'),
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(50, 'Username maksimal 50 karakter')
    .regex(/^[a-z0-9_]+$/, 'Username hanya boleh mengandung huruf kecil, angka, dan underscore')
    .optional()
    .nullable(),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung huruf kapital')
    .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Password harus mengandung angka')
    .regex(/[^A-Za-z0-9]/, 'Password harus mengandung karakter spesial')
    .optional()
    .nullable(),
  avatarUrl: z.string().url('URL avatar tidak valid').optional(),
  locale: z.string().default('en'),
})

export default defineEventHandler(async (event) => {
  try {
    const db = event.context.db
    const now = Math.floor(Date.now() / 1000)

    // Verify authentication
    const auth = await requireAuth(event)
    if (!auth.success) {
      return auth.error
    }

    // Validate request body
    const body = await readValidatedBody(event, (body) => CreateUserSchema.safeParse(body))
    if (!body.success) {
      return createErrorResponse(400, 'Invalid request', {
        issues: body.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    // Check if email already exists
    const existingEmail = await db
      .selectFrom('emails')
      .where('email', '=', body.data.email)
      .select(['id'])
      .executeTakeFirst()

    if (existingEmail) {
      return createErrorResponse(409, `Email '${body.data.email}' sudah terdaftar`)
    }

    let username = body.data.username

    // Generate username if not provided
    if (!username) {
      username = generateUsername(body.data.email)

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
          username = generateUsername(body.data.email)
          attempt++
        }
      }

      if (!isUnique) {
        return createErrorResponse(500, 'Gagal generate username yang unik')
      }
    } else {
      const existingUser = await db
        .selectFrom('users')
        .where('username', '=', username)
        .select(['id'])
        .executeTakeFirst()

      if (existingUser) {
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
          firstName: body.data.firstName,
          lastName: body.data.lastName || null,
          username,
          avatarUrl: body.data.avatarUrl || null,
          locale: body.data.locale,
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
          email: body.data.email,
          isPrimary: 1,
          isVerified: 0,
          createdAt: now,
        })
        .execute()

      if (body.data.password) {
        const hashedPassword = await hashPassword(body.data.password)
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
