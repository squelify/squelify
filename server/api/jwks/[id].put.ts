import { z } from 'zod'
import { JWKSchema } from '~/database/schemas/jwk'

export interface IUpdateJWKResponse {
  jwk: {
    id: string
    keyId: string
    publicKey: string
    algorithm: string
    isActive: boolean
    expiresAt: string
    updatedAt: string
  }
}

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

    const jwk = await db
      .selectFrom('jwks')
      .where('id', '=', jwkId)
      .select(['id', 'keyId', 'isActive', 'expiresAt'])
      .executeTakeFirst()

    if (!jwk) {
      await auditLog(event, {
        action: 'update',
        entity: 'jwk',
        entityId: jwkId,
        metadata: {
          success: false,
          reason: 'jwk_not_found',
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'JWK not found', 404)
    }

    if (body.keyId && body.keyId !== jwk.keyId) {
      const existingKey = await db
        .selectFrom('jwks')
        .where('keyId', '=', body.keyId as string)
        .select(['id'])
        .executeTakeFirst()

      if (existingKey) {
        await auditLog(event, {
          action: 'update',
          entity: 'jwk',
          entityId: jwkId,
          metadata: {
            success: false,
            reason: 'key_id_exists',
            keyId: body.keyId,
          },
          retention: 'CRITICAL',
        })
        return createErrorResponse(event, 'Key ID already exists', 409)
      }
    }

    if (body.expiresAt && Number(body.expiresAt) <= now) {
      await auditLog(event, {
        action: 'update',
        entity: 'jwk',
        entityId: jwkId,
        metadata: {
          success: false,
          reason: 'invalid_expiration',
          expiresAt: body.expiresAt,
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Expiration time must be in the future', 400)
    }

    const updateData: any = {
      ...body,
      isActive: body.isActive !== undefined ? Number(body.isActive) : undefined,
      updatedAt: now,
    }

    for (const key of Object.keys(updateData)) {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    }

    const updatedJwk = await db
      .updateTable('jwks')
      .set(updateData)
      .where('id', '=', jwkId)
      .returning(['id', 'keyId', 'publicKey', 'algorithm', 'isActive', 'expiresAt', 'updatedAt'])
      .executeTakeFirst()

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
      retention: 'CRITICAL',
    })

    return createSuccessResponse<IUpdateJWKResponse>(event, 'JWK updated successfully', {
      jwk: {
        ...updatedJwk,
        isActive: Boolean(updatedJwk.isActive),
        expiresAt: toISOString(updatedJwk.expiresAt),
        updatedAt: toISOString(updatedJwk.updatedAt),
      },
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})

defineRouteMeta({
  openAPI: {
    summary: 'Update a JWK',
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
