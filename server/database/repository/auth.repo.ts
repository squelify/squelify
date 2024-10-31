import { type Kysely } from 'kysely'
import { typeid } from 'typeid-js'
import { verifyPassword } from '~/utils/string'
import type { Database } from '../db.schema'

interface CreateSessionOptions {
  ipAddress: string
  userAgent: string
  deviceId?: string
  deviceType?: string
  location?: string
  keyId: string
}

/**
 * Find user account by email and verify password
 * Returns user data with verified email if credentials are valid
 */
export async function verifyUserCredentials(db: Kysely<Database>, email: string, password: string) {
  const user = await db
    .selectFrom('users')
    .innerJoin('emails', 'emails.userId', 'users.id')
    .innerJoin('passwords', 'passwords.userId', 'users.id')
    .where('emails.email', '=', email)
    .where('users.isActive', '=', 1)
    .where('emails.isVerified', '=', 1)
    .select([
      'users.id',
      'users.firstName',
      'users.lastName',
      'users.locale',
      'emails.email',
      'passwords.hash',
    ])
    .executeTakeFirst()

  if (!user) return null

  const isValid = await verifyPassword(password, user.hash)
  if (!isValid) return null

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    locale: user.locale,
  }
}

/**
 * Create new session for authenticated user
 * Handles session creation with device tracking and metadata
 */
export async function createUserSession(
  db: Kysely<Database>,
  userId: string,
  options: CreateSessionOptions
) {
  const now = Math.floor(Date.now() / 1000)
  const expiresAt = now + 7 * 24 * 60 * 60 // 7 days

  // Update user's last sign in timestamp
  await db.updateTable('users').set({ lastSignInAt: now }).where('id', '=', userId).execute()

  const session = await db
    .insertInto('sessions')
    .values({
      id: typeid('sess').toString(),
      userId,
      keyId: options.keyId,
      refreshToken: typeid().toString(),
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      deviceId: options.deviceId,
      deviceType: options.deviceType,
      location: options.location,
      isActive: 1,
      expiresAt,
      lastActiveAt: now,
      createdAt: now,
    })
    .returningAll()
    .executeTakeFirst()

  return session
}
