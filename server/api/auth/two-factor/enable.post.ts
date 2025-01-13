import { typeid } from 'typeid-js'
import { z } from 'zod'
import { generateTOTPSecret, generateTOTPUri } from '~/utils/totp'

export interface IEnable2FAResponse {
  authenticator: {
    id: string
    secret: string
    backupCodes: string[]
    totpUri: string
    qrCodeUrl: string
    metadata: Record<string, any>
  }
}

const Enable2FASchema = z
  .object({
    type: z.literal('totp'),
    name: z.string().min(1, 'Authenticator name is required'),
  })
  .strict()

export default defineEventHandler(async (event) => {
  const payload = event.context.auth?.payload
  const appConfig = event.context.appConfig
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, Enable2FASchema)
    const now = Math.floor(Date.now() / 1000)

    const user = await db
      .selectFrom('sq_users as u')
      .leftJoin('sq_emails as e', 'e.userId', 'u.id')
      .where('u.id', '=', payload.sub)
      .where('u.deletedAt', 'is', null)
      .where('e.isPrimary', '=', 1)
      .select(['u.id', 'u.username', 'e.email'])
      .executeTakeFirst()

    if (!user) {
      await auditLog(event, {
        action: 'enable',
        entity: 'two_factor',
        entityId: 'anonymous',
        metadata: {
          success: false,
          reason: 'user_not_found',
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'User not found', 404)
    }

    const existingAuth = await db
      .selectFrom('sq_two_factors')
      .where('userId', '=', user.id)
      .where('name', '=', body.name)
      .select(['id'])
      .executeTakeFirst()

    if (existingAuth) {
      await auditLog(event, {
        action: 'enable',
        entity: 'two_factor',
        entityId: user.id,
        metadata: {
          success: false,
          reason: 'name_exists',
          name: body.name,
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Authenticator name already in use', 400)
    }

    const secret = generateTOTPSecret()
    const backupCodes = Array.from({ length: 10 }, () => generateRandomStr({ size: 8 }))

    const existing2FA = await db
      .selectFrom('sq_two_factors')
      .where('userId', '=', user.id)
      .where('verifiedAt', '!=', null)
      .select(['id'])
      .executeTakeFirst()

    const id = typeid('totp').toString()

    await db.transaction().execute(async (trx) => {
      await trx
        .insertInto('sq_two_factors')
        .values({
          id,
          userId: user.id,
          name: body.name,
          type: 'totp',
          secret,
          backupCodes: JSON.stringify(backupCodes),
          verifiedAt: null,
          isPrimary: existing2FA ? 0 : 1,
          createdAt: now,
        })
        .execute()

      await trx
        .insertInto('sq_user_metadata')
        .values({
          id: typeid('meta').toString(),
          userId: user.id,
          key: '2fa_enabled_at',
          value: String(now),
          isPublic: 1,
          createdAt: now,
        })
        .execute()
    })

    const totpUri = generateTOTPUri({
      secret,
      accountName: user.email || user.username,
      issuer: appConfig.title,
    })

    const qrCodeUrl = `${appConfig.baseURL}/api/qrcode?chl=${encodeURIComponent(totpUri)}`

    const metadata = await db
      .selectFrom('sq_user_metadata')
      .where('userId', '=', user.id)
      .where('isPublic', '=', 1)
      .select(['key', 'value'])
      .execute()

    await auditLog(event, {
      action: 'enable',
      entity: 'two_factor',
      entityId: id,
      metadata: {
        success: true,
        userId: user.id,
        type: 'totp',
        name: body.name,
      },
      retention: 'CRITICAL',
    })

    return createSuccessResponse<IEnable2FAResponse>(
      event,
      'TOTP created successfully, verify TOTP code to enable 2FA',
      {
        authenticator: {
          id,
          secret,
          backupCodes,
          totpUri,
          qrCodeUrl,
          metadata: metadata.reduce((acc, { key, value }) => {
            acc[key] = value
            return acc
          }, {}),
        },
      }
    )
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
