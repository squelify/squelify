import { type Kysely } from 'kysely'
import { typeid } from 'typeid-js'
import type { Database } from '~/database/db.schema'
import { verifyPassword } from '~/utils/security'
import { DEFAULT_PASSWORD_ALGORITHM, PASSWORD_POLICIES } from '../schemas/password'

interface CreateSessionOptions {
  ipAddress: string
  userAgent: string
  deviceId?: string
  deviceType?: string
  location?: string
  keyId: string
}

export async function verifyUserCredentials(db: Kysely<Database>, email: string, password: string) {
  const user = await db
    .selectFrom('users as u')
    .innerJoin('emails as e', (join) =>
      join.onRef('e.userId', '=', 'u.id').on('e.isPrimary', '=', 1)
    )
    .innerJoin('passwords as p', 'p.userId', 'u.id')
    .leftJoin('user_bans as ub', (join) =>
      join
        .onRef('ub.userId', '=', 'u.id')
        .on((eb) =>
          eb.or([
            eb('ub.expiresAt', '>', Math.floor(Date.now() / 1000)),
            eb('ub.expiresAt', 'is', null),
          ])
        )
    )
    .where('e.email', '=', email)
    .where('e.verifiedAt', 'is not', null)
    .where('u.isActive', '=', 1)
    .where('u.deletedAt', 'is', null)
    .select([
      'u.id',
      'u.firstName',
      'u.lastName',
      'u.isActive',
      'e.email',
      'p.hash as passwordHash',
      'p.algorithm as passwordAlgorithm',
      'ub.reason as banReason',
      'ub.expiresAt as bannedUntil',
    ])
    .executeTakeFirst()

  if (!user) return null

  const isValid = await verifyPassword(password, user.passwordHash, user.passwordAlgorithm)
  if (!isValid) return null

  // Get user metadata
  const metadata = await db
    .selectFrom('user_metadata')
    .where('userId', '=', user.id)
    .where('isPublic', '=', 1)
    .select(['key', 'value'])
    .execute()

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: Boolean(user.isActive),
    isBanned: user.banReason !== null,
    bannedUntil: user.bannedUntil,
    banReason: user.banReason,
    metadata: metadata.reduce(
      (acc, { key, value }) => {
        acc[key] = value
        return acc
      },
      {} as Record<string, string>
    ),
  }
}

export async function createUserSession(
  db: Kysely<Database>,
  userId: string,
  options: CreateSessionOptions
) {
  const now = Math.floor(Date.now() / 1000)
  const expiresAt = now + 7 * 24 * 60 * 60 // 7 days

  // Check if metadata exists first
  const existingMeta = await db
    .selectFrom('user_metadata')
    .where('userId', '=', userId)
    .where('key', '=', 'last_sign_in_at')
    .select('id')
    .executeTakeFirst()

  if (existingMeta) {
    await db
      .updateTable('user_metadata')
      .set({
        value: String(now),
        updatedAt: now,
      })
      .where('id', '=', existingMeta.id)
      .execute()
  } else {
    await db
      .insertInto('user_metadata')
      .values({
        id: typeid('meta').toString(),
        userId,
        key: 'last_sign_in_at',
        value: String(now),
        isPublic: 0,
        createdAt: now,
      })
      .execute()
  }

  const session = await db
    .insertInto('sessions')
    .values({
      id: typeid('sess').toString(),
      userId,
      keyId: options.keyId,
      refreshToken: typeid('rtok').toString(),
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

export async function changePassword(db: Kysely<Database>, userId: string, newPassword: string) {
  const hash = await hashPassword(newPassword, DEFAULT_PASSWORD_ALGORITHM)

  return db.transaction().execute(async (trx) => {
    // Get current password
    const current = await trx
      .selectFrom('passwords')
      .where('userId', '=', userId)
      .select(['hash', 'previousHashes'])
      .executeTakeFirst()

    // Store password history
    if (current) {
      const previousHashes = JSON.parse(JSON.stringify(current.previousHashes) || '[]')
      previousHashes.push(current.hash)

      // Keep last 5 passwords
      if (previousHashes.length > 5) previousHashes.shift()

      const now = Math.floor(Date.now() / 1000)

      await trx
        .updateTable('passwords')
        .set({
          hash,
          algorithm: DEFAULT_PASSWORD_ALGORITHM,
          previousHashes: JSON.stringify(previousHashes),
          lastChangedAt: now,
          updatedAt: now,
        })
        .where('userId', '=', userId)
        .execute()
    }
  })
}

export async function validatePasswordAttempt(db: Kysely<Database>, userId: string) {
  return db.transaction().execute(async (trx) => {
    const password = await trx
      .selectFrom('passwords')
      .where('userId', '=', userId)
      .select(['id', 'failedAttempts', 'lockedUntil'])
      .executeTakeFirst()

    if (!password) return false

    if (password.lockedUntil && password.lockedUntil > Date.now() / 1000) {
      return false
    }

    if (password.failedAttempts >= PASSWORD_POLICIES.MAX_ATTEMPTS) {
      await trx
        .updateTable('passwords')
        .set({
          lockedUntil: PASSWORD_POLICIES.LOCKOUT_DURATION,
          lastAttemptAt: Math.floor(Date.now() / 1000),
        })
        .where('id', '=', password.id)
        .execute()
      return false
    }

    return true
  })
}
