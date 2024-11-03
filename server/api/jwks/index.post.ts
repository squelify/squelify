import { typeid } from 'typeid-js'
import { JWKSchema } from '~/database/schemas/jwk'

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

    // Check if keyId already exists
    const existingKey = await db
      .selectFrom('jwks')
      .where('keyId', '=', keyId)
      .select(['id'])
      .executeTakeFirst()

    if (existingKey) {
      setResponseStatus(event, 409)
      return createErrorResponse(409, 'Key ID already exists')
    }

    // Validate expiration time
    if (Number(body.expiresAt) <= now) {
      setResponseStatus(event, 400)
      return createErrorResponse(400, 'Expiration time must be in the future')
    }

    // Create JWK
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

    // Log JWK creation
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
    })

    return {
      status: 200,
      success: true,
      message: 'JWK created successfully',
      data: {
        id: jwk.id,
        keyId: jwk.keyId,
        publicKey: jwk.publicKey,
        algorithm: jwk.algorithm,
        isActive: Boolean(jwk.isActive),
        expiresAt: toISOString(jwk.expiresAt),
        createdAt: toISOString(jwk.createdAt),
      },
    }
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})

defineRouteMeta({
  openAPI: {
    summary: 'Details of a JWK',
    tags: ['Administration'],
  },
})
