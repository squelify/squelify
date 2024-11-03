import { isProduction } from 'std-env'
import { typeid } from 'typeid-js'
import { z } from 'zod'

export interface ISignupResponse {
  message: string
  verificationUrl?: string // Only in development
}

export const SignupRequestSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must not exceed 50 characters')
      .regex(
        /^[a-z0-9_]+$/,
        'Username can only contain lowercase letters, numbers, and underscores'
      ),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain uppercase letters')
      .regex(/[a-z]/, 'Password must contain lowercase letters')
      .regex(/[0-9]/, 'Password must contain numbers')
      .regex(/[^A-Za-z0-9]/, 'Password must contain special characters'),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
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
      await auditLog(event, {
        action: 'create',
        entity: 'user',
        entityId: 'anonymous',
        metadata: {
          success: false,
          email: body.email,
          reason: 'email_exists',
        },
      })

      return createErrorResponse(event, 'Email address already registered', 400)
    }

    let username = body.username

    // Generate username if not provided
    if (!username) {
      username = generateUsername(body.email)

      // Check username availability
      const existingUser = await db
        .selectFrom('users')
        .where('username', '=', username)
        .select(['id'])
        .executeTakeFirst()

      if (existingUser) {
        // Generate unique username with random suffix
        username = generateUsername(body.email, generateRandomStr({ size: 4 }))
      }
    }

    // Check final username availability
    const existingUser = await db
      .selectFrom('users')
      .where('username', '=', username)
      .select(['id'])
      .executeTakeFirst()

    if (existingUser) {
      await auditLog(event, {
        action: 'create',
        entity: 'user',
        entityId: 'anonymous',
        metadata: {
          success: false,
          email: body.email,
          reason: 'username_exists',
        },
      })

      return createErrorResponse(event, `Username '${username}' is already taken`, 409)
    }

    // Create user account
    const userId = typeid('user').toString()
    const hashedPassword = await hashPassword(body.password)
    const now = Math.floor(Date.now() / 1000)
    const verificationToken = typeid().toString()

    // Create user account transaction
    await db.transaction().execute(async (trx) => {
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

      await trx
        .insertInto('passwords')
        .values({
          id: typeid('pwd').toString(),
          userId,
          hash: hashedPassword,
          algorithm: 'scrypt',
          createdAt: now,
        })
        .execute()

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

      await trx
        .insertInto('emails')
        .values({
          id: typeid('eml').toString(),
          userId,
          email: body.email,
          isPrimary: 1,
          createdAt: now,
        })
        .execute()

      await trx
        .insertInto('verifications')
        .values({
          id: typeid('ver').toString(),
          userId,
          type: 'email',
          identifier: body.email,
          token: verificationToken,
          expiresAt: now + 24 * 60 * 60, // 24 hours
          createdAt: now,
        })
        .execute()
    })

    // Log successful signup
    await auditLog(event, {
      action: 'create',
      entity: 'user',
      entityId: userId,
      userId: userId,
      newValues: {
        id: userId,
        username,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
      },
      metadata: {
        success: true,
      },
    })

    const verificationUrl = `${appConfig.baseURL}/api/auth/email/verify?token=${verificationToken}`
    logger.debug('[app]', `Verification URL: ${verificationUrl}`)

    const response: ISignupResponse = {
      message: 'Registration successful, please check your email for verification',
    }

    // Include verification URL in development
    if (!isProduction) {
      response.verificationUrl = verificationUrl
    }

    return createSuccessResponse<ISignupResponse>(event, response.message, response)
  } catch (error) {
    await auditLog(event, {
      action: 'create',
      entity: 'user',
      entityId: 'anonymous',
      metadata: {
        success: false,
        error: error.message,
      },
    })

    return throwErrorResponse(event, error)
  }
})
