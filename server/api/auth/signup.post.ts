import { typeid } from 'typeid-js'
import { z } from 'zod'
import { DEFAULT_PASSWORD_ALGORITHM } from '~/database/schemas/password'
import { VerifyEmailProps } from '~/mailer/templates/verify-email'
import { sendJSXEmail } from '~/utils/notify'

export interface ISignupResponse {
  email: string
  expiresIn: number
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
      )
      .optional(),
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
    const email = body.email.toLowerCase()

    const existingEmail = await db
      .selectFrom('_sq_emails')
      .where('email', '=', email)
      .select('id')
      .executeTakeFirst()

    if (existingEmail) {
      await auditLog(event, {
        action: 'create',
        entity: 'user',
        entityId: 'anonymous',
        metadata: {
          success: false,
          email,
          reason: 'email_exists',
        },
        retention: 'CRITICAL',
      })

      return createErrorResponse(event, 'Email address already registered', 400)
    }

    let username = body.username

    if (!username) {
      username = generateUsername(email)

      const existingUser = await db
        .selectFrom('_sq_users')
        .where('username', '=', username)
        .where('deletedAt', 'is', null)
        .select(['id'])
        .executeTakeFirst()

      if (existingUser) {
        username = generateUsername(email, generateRandomStr({ size: 4 }))
      }
    }

    const existingUser = await db
      .selectFrom('_sq_users')
      .where('username', '=', username)
      .where('deletedAt', 'is', null)
      .select(['id'])
      .executeTakeFirst()

    if (existingUser) {
      await auditLog(event, {
        action: 'create',
        entity: 'user',
        entityId: 'anonymous',
        metadata: {
          success: false,
          email: email,
          reason: 'username_exists',
        },
        retention: 'CRITICAL',
      })

      return createErrorResponse(event, `Username '${username}' is already taken`, 409)
    }

    const userId = typeid('user').toString()
    const hashedPassword = await hashPassword(body.password, DEFAULT_PASSWORD_ALGORITHM)
    const now = Math.floor(Date.now() / 1000)
    const verificationToken = typeid().toString()

    await db.transaction().execute(async (trx) => {
      await trx
        .insertInto('_sq_superusers')
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
        .insertInto('_sq_user_metadata')
        .values({
          id: typeid('meta').toString(),
          userId,
          key: 'signup_date',
          value: String(now),
          isPublic: 1,
          createdAt: now,
        })
        .execute()

      await trx
        .insertInto('_sq_passwords')
        .values({
          id: typeid('pwd').toString(),
          userId,
          hash: hashedPassword,
          algorithm: DEFAULT_PASSWORD_ALGORITHM,
          createdAt: now,
        })
        .execute()

      await trx
        .insertInto('_sq_accounts')
        .values({
          id: typeid('acc').toString(),
          userId,
          provider: 'local',
          providerAccountId: userId,
          createdAt: now,
        })
        .execute()

      await trx
        .insertInto('_sq_emails')
        .values({
          id: typeid('eml').toString(),
          userId,
          email: email,
          isPrimary: 1,
          createdAt: now,
        })
        .execute()

      await trx
        .insertInto('_sq_verifications')
        .values({
          id: typeid('ver').toString(),
          userId,
          type: 'email',
          identifier: email,
          token: verificationToken,
          expiresAt: now + DURATION.DAY,
          createdAt: now,
        })
        .execute()

      const defaultRole = await trx
        .selectFrom('_sq_roles')
        .where('isDefault', '=', 1)
        .select(['id'])
        .executeTakeFirst()

      if (defaultRole) {
        await trx
          .insertInto('_sq_user_roles')
          .values({
            id: typeid('urol').toString(),
            userId,
            roleId: defaultRole.id,
            createdAt: now,
          })
          .execute()
      }
    })

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
        email: email,
      },
      metadata: {
        success: true,
      },
      retention: 'CRITICAL',
    })

    const verificationUrl = `${appConfig.baseURL}/api/auth/email/verify?token=${verificationToken}`
    const message = 'Registration successful, please check your email for verification'

    // Send verification email
    await sendJSXEmail<VerifyEmailProps>('verify-email', email, {
      email,
      token: verificationToken,
      url: verificationUrl,
    })

    return createSuccessResponse<ISignupResponse>(event, message, {
      email: email,
      expiresIn: DURATION.DAY,
    })
  } catch (error) {
    await auditLog(event, {
      action: 'create',
      entity: 'user',
      entityId: 'anonymous',
      metadata: {
        success: false,
        error: error.message,
      },
      retention: 'CRITICAL',
    })

    return throwErrorResponse(event, error)
  }
})
