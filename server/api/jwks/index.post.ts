import { typeid } from 'typeid-js'
import { JWKSchema } from '~/database/schemas/jwk'

export interface ICreateJWKResponse {
  jwk: {
    id: string
    keyId: string
    publicKey: string
    algorithm: string
    isActive: boolean
    expiresAt: string
    createdAt: string
  }
}

const CreateJWKSchema = JWKSchema.pick({
  keyId: true,
  publicKey: true,
  privateKey: true,
  algorithm: true,
  expiresAt: true,
}).partial({
  algorithm: true,
  keyId: true,
})

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const userId = event.context.auth.payload.sub
  const userEmail = event.context.auth.payload.email
  const now = Math.floor(Date.now() / 1000)

  try {
    const body = await requireValidatedBody(event, CreateJWKSchema)
    const keyId = body.keyId || typeid('kid').toString()

    const existingKey = await db
      .selectFrom('jwks')
      .where('keyId', '=', keyId)
      .select(['id'])
      .executeTakeFirst()

    if (existingKey) {
      await auditLog(event, {
        action: 'create',
        entity: 'jwk',
        entityId: keyId,
        metadata: {
          success: false,
          reason: 'key_id_exists',
          keyId,
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Key ID already exists', 409)
    }

    if (Number(body.expiresAt) <= now) {
      await auditLog(event, {
        action: 'create',
        entity: 'jwk',
        entityId: keyId,
        metadata: {
          success: false,
          reason: 'invalid_expiration',
          expiresAt: body.expiresAt,
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Expiration time must be in the future', 400)
    }

    const jwk = await db
      .insertInto('jwks')
      .values({
        id: typeid('jwk').toString(),
        keyId: keyId,
        publicKey: body.publicKey,
        privateKey: body.privateKey,
        algorithm: body.algorithm || 'ES256',
        isActive: 1,
        expiresAt: Number(body.expiresAt),
        createdAt: now,
      })
      .returning(['id', 'keyId', 'publicKey', 'algorithm', 'isActive', 'expiresAt', 'createdAt'])
      .executeTakeFirst()

    await auditLog(event, {
      action: 'create',
      entity: 'jwk',
      entityId: jwk.id,
      metadata: {
        success: true,
        keyId: jwk.keyId,
        algorithm: jwk.algorithm,
        createdBy: {
          id: userId,
          email: userEmail,
        },
      },
      retention: 'CRITICAL',
    })

    return createSuccessResponse<ICreateJWKResponse>(event, 'JWK created successfully', {
      jwk: {
        ...jwk,
        isActive: Boolean(jwk.isActive),
        expiresAt: toISOString(jwk.expiresAt),
        createdAt: toISOString(jwk.createdAt),
      },
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})

defineRouteMeta({
  openAPI: {
    summary: 'Create a new JWK',
    tags: ['Administration'],
    parameters: [
      {
        in: 'header',
        name: 'Contennt-Type',
        required: true,
        example: 'application/json',
      },
    ],
    responses: {
      200: { $ref: 'resp-ok' },
      400: { $ref: 'resp-bad-request' },
      500: { $ref: 'resp-internal-server-error' },
    },
  },
})
