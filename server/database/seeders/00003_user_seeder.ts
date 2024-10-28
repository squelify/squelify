import consola from 'consola'
import { type Kysely } from 'kysely'
import { typeid } from 'typeid-js'
import type { Database } from '~/database/db.schema'
import type { AccountInsert } from '~/database/schemas/account'
import type { EmailInsert } from '~/database/schemas/email'
import type { MemberInsert } from '~/database/schemas/member'
import type { OrganizationInsert } from '~/database/schemas/organization'
import type { PasswordInsert } from '~/database/schemas/password'
import type { UserInsert } from '~/database/schemas/user'
import type { UserRoleInsert } from '~/database/schemas/user_role'
import { hashPassword } from '~/utils/string'

export default async function seed(db: Kysely<Database>): Promise<void> {
  await db.transaction().execute(async (trx) => {
    const now = Math.floor(Date.now() / 1000)

    // Check for existing admin user
    const existingUser = await trx
      .selectFrom('emails')
      .where('email', '=', 'admin@example.com')
      .select('userId')
      .executeTakeFirst()

    if (existingUser) {
      consola.warn('Admin user already exists, skipping user seed')
      return
    }

    // Check for existing root organization
    const existingOrg = await trx
      .selectFrom('organizations')
      .where('slug', '=', 'root-org')
      .select('id')
      .executeTakeFirst()

    if (existingOrg) {
      consola.warn('Root organization already exists, skipping organization seed')
      return
    }

    // Create admin user
    const userId = typeid('user').toString()
    const newUser: UserInsert = {
      id: userId,
      username: 'admin',
      firstName: 'Admin',
      lastName: 'Sistem',
      locale: 'en',
      isActive: 1,
      createdAt: now,
    }

    // Create admin email
    const emailId = typeid('eml').toString()
    const newEmail: EmailInsert = {
      id: emailId,
      userId: userId,
      email: 'admin@example.com',
      isPrimary: 1,
      isVerified: 1,
      verifiedAt: now,
      createdAt: now,
    }

    // Create admin password
    const passwordId = typeid('pwd').toString()
    const hashedPassword = await hashPassword('@Passw0rd$123')
    const newPassword: PasswordInsert = {
      id: passwordId,
      userId: userId,
      hash: hashedPassword,
      algorithm: 'argon2id',
      createdAt: now,
    }

    // Create root organization
    const orgId = typeid('org').toString()
    const newOrg: OrganizationInsert = {
      id: orgId,
      name: 'Root Organization',
      slug: 'root-org',
      isVerified: 1,
      settings: '{}',
      metadata: '{}',
      createdAt: now,
    }

    // Create admin membership
    const memberId = typeid('mem').toString()
    const newMember: MemberInsert = {
      id: memberId,
      organizationId: orgId,
      userId: userId,
      role: 'owner',
      isDefault: 1,
      createdAt: now,
    }

    // Create admin account
    const accountId = typeid('acc').toString()
    const newAccount: AccountInsert = {
      id: accountId,
      userId: userId,
      provider: 'local',
      providerAccountId: userId,
      createdAt: now,
    }

    // Get admin role
    const adminRole = await trx
      .selectFrom('roles')
      .where('name', '=', 'admin')
      .select('id')
      .executeTakeFirst()

    if (!adminRole) {
      throw new Error('Admin role not found')
    }

    // Assign admin role
    const userRoleId = typeid('urol').toString()
    const newUserRole: UserRoleInsert = {
      id: userRoleId,
      userId: userId,
      roleId: adminRole.id,
      createdAt: now,
    }

    // Execute all inserts
    await trx.insertInto('users').values(newUser).execute()
    await trx.insertInto('emails').values(newEmail).execute()
    await trx.insertInto('passwords').values(newPassword).execute()
    await trx.insertInto('organizations').values(newOrg).execute()
    await trx.insertInto('members').values(newMember).execute()
    await trx.insertInto('accounts').values(newAccount).execute()
    await trx.insertInto('user_roles').values(newUserRole).execute()

    consola.info('Admin user and organization created successfully')
  })
}
