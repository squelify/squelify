import * as jose from 'jose'
import { typeid } from 'typeid-js'
import { z } from 'zod'
import { AppConfig } from '~/config'
import { generateTOTPSecret, generateTOTPUri } from '~/utils/totp'

const Enable2FASchema = z
  .object({
    type: z.literal('totp'),
    name: z.string().min(1, 'Nama authenticator diperlukan'),
  })
  .strict()

export default defineEventHandler(async (event) => {
  try {
    const db = event.context.db
    const appConfig = useAppConfig(event) as AppConfig

    const token = getRequestHeader(event, 'Authorization')?.replace('Bearer ', '')

    if (!token) {
      return createErrorResponse(401, 'Token tidak ditemukan')
    }

    // Extract key ID from token header
    const decoded = jose.decodeProtectedHeader(token)
    if (!decoded.kid) {
      return createErrorResponse(401, 'Invalid token format')
    }

    const now = Math.floor(Date.now() / 1000)

    // Get JWK used for signing
    const jwk = await db
      .selectFrom('jwks')
      .where('keyId', '=', decoded.kid)
      .where('isActive', '=', 1)
      .where('expiresAt', '>', now)
      .select(['keyId', 'publicKey', 'algorithm'])
      .executeTakeFirst()

    if (!jwk) {
      return createErrorResponse(401, 'Invalid token signature')
    }

    // Verify token and decode payload
    const payload = await verifyAccessToken(token, jwk)
    if (!payload) {
      return createErrorResponse(401, 'Token tidak valid')
    }

    // Check if session is still valid
    const session = await db
      .selectFrom('sessions')
      .where('id', '=', payload.sid)
      .where('userId', '=', payload.sub)
      .where('isActive', '=', 1)
      .where('expiresAt', '>', now)
      .select(['id'])
      .executeTakeFirst()

    if (!session) {
      return createErrorResponse(401, 'Session tidak valid atau telah berakhir')
    }

    const body = await readValidatedBody(event, (body) => Enable2FASchema.safeParse(body))
    if (!body.success) {
      return createErrorResponse(400, 'Invalid request', {
        issues: body.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    // Get user info for TOTP setup
    const user = await db
      .selectFrom('users')
      .leftJoin('emails', 'emails.userId', 'users.id')
      .where('users.id', '=', payload.sub)
      .where('emails.isPrimary', '=', 1)
      .select(['users.id', 'users.username', 'emails.email'])
      .executeTakeFirst()

    if (!user) {
      return createErrorResponse(404, 'User tidak ditemukan')
    }

    // Check if authenticator name already exists
    const existingAuth = await db
      .selectFrom('two_factors')
      .where('userId', '=', user.id)
      .where('name', '=', body.data.name)
      .select(['id'])
      .executeTakeFirst()

    if (existingAuth) {
      return createErrorResponse(400, 'Nama authenticator sudah digunakan')
    }

    // Generate TOTP secret and backup codes
    const secret = generateTOTPSecret()
    const backupCodes = Array.from({ length: 10 }, () => generateRandomStr({ size: 8 }))

    // Check if this is first 2FA setup
    const existing2FA = await db
      .selectFrom('two_factors')
      .where('userId', '=', user.id)
      .where('isVerified', '=', 1)
      .select(['id'])
      .executeTakeFirst()

    // Create TOTP record
    const id = typeid('totp').toString()
    await db
      .insertInto('two_factors')
      .values({
        id: id,
        userId: user.id,
        name: body.data.name,
        type: 'totp',
        secret: secret,
        backupCodes: JSON.stringify(backupCodes),
        isVerified: 0,
        isPrimary: existing2FA ? 0 : 1, // Set as primary if first 2FA
        createdAt: now,
      })
      .execute()

    // Generate TOTP URI for QR code
    const totpUri = generateTOTPUri({
      secret,
      accountName: user.email || user.username,
      issuer: appConfig.title,
    })

    const qrCodeUrl = `${appConfig.baseURL}/api/qrcode?chl=${encodeURIComponent(totpUri)}`

    return {
      status: 200,
      success: true,
      message: 'TOTP berhasil dibuat',
      data: {
        id: id,
        secret,
        backupCodes,
        totpUri,
        qrCodeUrl,
      },
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
