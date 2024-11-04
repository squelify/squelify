import { type Kysely } from 'kysely'
import { typeid } from 'typeid-js'
import type { Database } from '~/database/db.schema'
import { verifyPassword } from '~/utils/string'

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
      'p.hash',
      'ub.reason as banReason',
      'ub.expiresAt as bannedUntil',
    ])
    .executeTakeFirst()

  if (!user) return null

  const isValid = await verifyPassword(password, user.hash)
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
