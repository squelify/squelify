import { z } from 'zod'
import { JWKSchema } from '~/database/schemas/jwk'

const UpdateJWKSchema = JWKSchema.pick({
  keyId: true,
  publicKey: true,
  privateKey: true,
  algorithm: true,
  expiresAt: true,
})
  .extend({ isActive: z.boolean().optional() })
  .partial()

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const jwkId = event.context.params.id
  const userId = event.context.auth.payload.sub
  const userEmail = event.context.auth.payload.email
  const now = Math.floor(Date.now() / 1000)

  try {
    const body = await requireValidatedBody(event, UpdateJWKSchema)

    // Get JWK
    const jwk = await db
      .selectFrom('jwks')
      .where('id', '=', jwkId)
      .select(['id', 'keyId', 'isActive', 'expiresAt'])
      .executeTakeFirst()

    if (!jwk) {
      setResponseStatus(event, 404)
      return createErrorResponse(404, 'JWK not found')
    }

    // Check if keyId exists when updating
    if (body.keyId && body.keyId !== jwk.keyId) {
      const existingKey = await db
        .selectFrom('jwks')
        .where('keyId', '=', body.keyId as string)
        .select(['id'])
        .executeTakeFirst()

      if (existingKey) {
        setResponseStatus(event, 409)
        return createErrorResponse(409, 'Key ID already exists')
      }
    }

    // Validate expiration time
    if (body.expiresAt && Number(body.expiresAt) <= now) {
      setResponseStatus(event, 400)
      return createErrorResponse(400, 'Expiration time must be in the future')
    }

    // Prepare update data with boolean to integer conversion
    const updateData: any = {
      ...body,
      isActive: body.isActive !== undefined ? Number(body.isActive) : undefined,
      updatedAt: now,
    }

    // Remove undefined properties
    for (const key of Object.keys(updateData)) {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    }

    // Update JWK
    const updatedJwk = await db
      .updateTable('jwks')
      .set(updateData)
      .where('id', '=', jwkId)
      .returning(['id', 'keyId', 'publicKey', 'algorithm', 'isActive', 'expiresAt', 'updatedAt'])
      .executeTakeFirst()

    // Log JWK update
    await auditLog(event, {
      action: 'update',
      entity: 'jwk',
      entityId: jwkId,
      metadata: {
        success: true,
        keyId: updatedJwk.keyId,
        algorithm: updatedJwk.algorithm,
        changes: body,
        updatedBy: {
          id: userId,
          email: userEmail,
        },
      },
    })

    return {
      status: 200,
      success: true,
      message: 'JWK updated successfully',
      data: {
        id: updatedJwk.id,
        keyId: updatedJwk.keyId,
        publicKey: updatedJwk.publicKey,
        algorithm: updatedJwk.algorithm,
        isActive: Boolean(updatedJwk.isActive),
        expiresAt: toISOString(updatedJwk.expiresAt),
        updatedAt: toISOString(updatedJwk.updatedAt),
      },
    }
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})

defineRouteMeta({
  openAPI: {
    summary: 'Update a JWK',
    tags: ['Administration'],
  },
})
