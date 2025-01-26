import { H3Error } from 'h3'
import * as jose from 'jose'
import { typeid } from 'typeid-js'
import { ZodError, z } from 'zod'
import { DEFAULT_PASSWORD_ALGORITHM } from '~/database/schemas/password'
import { hashPassword } from '~/utils/security'

const SetupSchema = z.object({
  firstName: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[A-Za-z\s]+$/),
  lastName: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[A-Za-z\s]+$/),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/),
  appName: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[A-Za-z0-9\s\-_]+$/),
  newsletter: z
    .string()
    .optional()
    .transform((val) => val === 'on'),
})

export default defineEventHandler(async (event) => {
  const appConfig = event.context.appConfig
  const db = event.context.db
  const now = Math.floor(Date.now() / 1000)

  try {
    const body = await readValidatedBody(event, (body) => SetupSchema.parse(body))
    if (!body) {
      throw createError({ statusCode: 400, message: 'Invalid form data' })
    }

    await db.transaction().execute(async (trx) => {
      // 1. Generate JWK first since we need it for JWT
      const { publicKey, privateKey } = await jose.generateKeyPair('ES256')
      const publicKeyString = await jose.exportSPKI(publicKey)
      const privateKeyString = await jose.exportPKCS8(privateKey)

      await trx
        .insertInto('_sq_jwks')
        .values({
          id: typeid('jwk').toString(),
          keyId: typeid('kid').toString(),
          publicKey: publicKeyString,
          privateKey: privateKeyString,
          algorithm: 'ES256',
          isActive: 1,
          expiresAt: now + TOKEN_DURATION.jwk,
          createdAt: now,
        })
        .execute()

      // 2. Create permissions
      const permissions = [
        {
          id: typeid('perm').toString(),
          name: 'manage:all',
          description: 'Full system access',
          category: 'system',
          action: 'manage',
          resource: '*',
          conditions: JSON.stringify({}),
          createdAt: now,
        },
        {
          id: typeid('perm').toString(),
          name: 'manage:users',
          description: 'Manage all users',
          category: 'user',
          action: 'manage',
          resource: 'users',
          conditions: JSON.stringify({}),
          createdAt: now,
        },
      ]

      await trx
        .insertInto('_sq_permissions')
        .values(permissions)
        .onConflict((oc) => oc.column('name').doNothing())
        .execute()

      // 3. Create admin role
      const adminRoleId = typeid('role').toString()
      await trx
        .insertInto('_sq_roles')
        .values({
          id: adminRoleId,
          name: 'admin',
          description: 'System Administrator',
          type: 'system',
          isDefault: 1,
          metadata: JSON.stringify({
            scope: 'global',
            priority: 1,
          }),
          createdAt: now,
        })
        .onConflict((oc) => oc.column('name').doNothing())
        .execute()

      // 4. Assign permissions to admin role
      const dbPermissions = await trx.selectFrom('_sq_permissions').select(['id']).execute()
      const rolePermissions = dbPermissions.map((permission) => ({
        id: typeid('rper').toString(),
        roleId: adminRoleId,
        permissionId: permission.id,
        conditions: JSON.stringify({}),
        createdAt: now,
      }))

      await trx
        .insertInto('_sq_role_permissions')
        .values(rolePermissions)
        .onConflict((oc) => oc.columns(['roleId', 'permissionId']).doNothing())
        .execute()

      // 5. Create admin user
      const userId = typeid('user').toString()
      const username = body.email.split('@')[0]
      await trx
        .insertInto('_sq_users')
        .values({
          id: userId,
          username,
          firstName: body.firstName,
          lastName: body.lastName,
          isActive: 1,
          createdAt: now,
        })
        .execute()

      // 6. Create admin email
      await trx
        .insertInto('_sq_emails')
        .values({
          id: typeid('eml').toString(),
          userId: userId,
          email: body.email,
          isPrimary: 1,
          verifiedAt: now,
          createdAt: now,
        })
        .execute()

      // 7. Create admin password
      const hashedPassword = await hashPassword(body.password, DEFAULT_PASSWORD_ALGORITHM)
      await trx
        .insertInto('_sq_passwords')
        .values({
          id: typeid('pwd').toString(),
          userId: userId,
          hash: hashedPassword,
          algorithm: DEFAULT_PASSWORD_ALGORITHM,
          createdAt: now,
        })
        .execute()

      // 8. Create root organization
      const orgId = typeid('org').toString()
      await trx
        .insertInto('_sq_organizations')
        .values({
          id: orgId,
          name: body.appName,
          slug: body.appName.toLowerCase().replace(/\s+/g, '-'),
          isVerified: 1,
          status: 'active',
          settings: JSON.stringify({}),
          metadata: JSON.stringify({}),
          createdBy: userId,
          createdAt: now,
        })
        .execute()

      // 9. Create admin membership
      await trx
        .insertInto('_sq_members')
        .values({
          id: typeid('mem').toString(),
          organizationId: orgId,
          userId: userId,
          role: 'org:owner',
          isDefault: 1,
          createdAt: now,
        })
        .execute()

      // 10. Create admin account
      await trx
        .insertInto('_sq_accounts')
        .values({
          id: typeid('acc').toString(),
          userId: userId,
          provider: 'local',
          providerAccountId: userId,
          createdAt: now,
        })
        .execute()

      // 11. Assign admin role
      await trx
        .insertInto('_sq_user_roles')
        .values({
          id: typeid('urol').toString(),
          userId: userId,
          roleId: adminRoleId,
          createdAt: now,
        })
        .execute()
    })

    // TODO: handle double slash in baseURL
    const message = encodeURIComponent('Installation completed')
    const redirectUrl = `${appConfig.baseURL}${appConfig.adminPath}/login?message=${message}`
    return sendRedirect(event, redirectUrl)
  } catch (error) {
    if (error instanceof H3Error) {
      const err = error.data.errors[0]
      const errorMessage = `${err.message} (${err.path.join(', ')})`
      return sendRedirect(
        event,
        `/admin/setup?token=1234567890?error=${encodeURIComponent(errorMessage)}`
      )
    }

    if (error instanceof ZodError) {
      throw createError({ statusCode: 400, message: error.errors[0].message })
    }

    throw createError({
      statusCode: 500,
      message: 'Installation failed',
    })
  }
})
