import { typeid } from 'typeid-js'
import { z } from 'zod'

const SignupRequestSchema = z
  .object({
    email: z.string().email('Email tidak valid'),
    username: z
      .string()
      .min(3, 'Username minimal 3 karakter')
      .max(50, 'Username maksimal 50 karakter')
      .regex(/^[a-z0-9_]+$/, 'Username hanya boleh mengandung huruf kecil, angka, dan underscore')
      .optional(),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(/[A-Z]/, 'Password harus mengandung huruf kapital')
      .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
      .regex(/[0-9]/, 'Password harus mengandung angka')
      .regex(/[^A-Za-z0-9]/, 'Password harus mengandung karakter spesial'),
    firstName: z.string().min(2, 'Nama depan minimal 2 karakter'),
    lastName: z.string().optional(),
  })
  .strict()

export default defineEventHandler(async (event) => {
  const appConfig = event.context.appConfig
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, SignupRequestSchema)

    // Check if email already exists
    const existingEmail = await db
      .selectFrom('emails')
      .where('email', '=', body.email)
      .select('id')
      .executeTakeFirst()

    if (existingEmail) {
      setResponseStatus(event, 400)
      return createErrorResponse(400, 'Email sudah terdaftar')
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

    // Create user account
    const userId = typeid('user').toString()
    const hashedPassword = await hashPassword(body.password)
    const now = Math.floor(Date.now() / 1000)

    await db.transaction().execute(async (trx) => {
      // Create user first
      await trx
        .insertInto('users')
        .values({
          id: userId,
          firstName: body.firstName,
          lastName: body.lastName || null,
          username,
          isActive: 1,
          createdAt: now,
        })
        .execute()

      // Create password record
      await trx
        .insertInto('passwords')
        .values({
          id: typeid('pwd').toString(),
          userId,
          hash: hashedPassword,
          algorithm: 'argon2id',
          createdAt: now,
        })
        .execute()

      // Create account
      await trx
        .insertInto('accounts')
        .values({
          id: typeid('acc').toString(),
          userId,
          provider: 'local',
          providerAccountId: userId,
          createdAt: now,
        })
        .execute()

      // Create email
      await trx
        .insertInto('emails')
        .values({
          id: typeid('eml').toString(),
          userId,
          email: body.email,
          isPrimary: 1,
          isVerified: 0,
          createdAt: now,
        })
        .execute()

      // Create verification token
      const verificationToken = typeid().toString()
      await trx
        .insertInto('verifications')
        .values({
          id: typeid('ver').toString(),
          userId,
          type: 'email',
          identifier: body.email,
          token: verificationToken,
          expiresAt: now + 24 * 60 * 60,
          createdAt: now,
        })
        .execute()

      // Send verification email
      const verificationUrl = `${appConfig.baseURL}/api/auth/email/verify?token=${verificationToken}`
      logger.info('[app]', 'Verification email: ', verificationUrl)

      // TODO: Send verification email using jsx-email
      // await sendJSXEmail('verify-email', body.email, {
      //   email: body.email,
      //   token: verificationToken,
      //   url: verificationUrl,
      // })
    })

    return {
      status: 200,
      success: true,
      message: 'Pendaftaran berhasil, silakan cek email untuk verifikasi',
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
