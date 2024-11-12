export interface IDeleteJWKResponse {
  jwk: {
    id: string
    keyId: string
  }
}

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const jwkId = event.context.params.id
  const userId = event.context.auth.payload.sub
  const userEmail = event.context.auth.payload.email

  try {
    const jwk = await db
      .selectFrom('jwks')
      .where('id', '=', jwkId)
      .select(['id', 'keyId', 'isActive'])
      .executeTakeFirst()

    if (!jwk) {
      await auditLog(event, {
        action: 'delete',
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

    if (jwk.isActive) {
      await auditLog(event, {
        action: 'delete',
        entity: 'jwk',
        entityId: jwkId,
        metadata: {
          success: false,
          reason: 'active_jwk_deletion_prevented',
          keyId: jwk.keyId,
          deletedBy: {
            id: userId,
            email: userEmail,
          },
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Cannot delete active JWK', 400)
    }

    await db.deleteFrom('jwks').where('id', '=', jwkId).execute()

    await auditLog(event, {
      action: 'delete',
      entity: 'jwk',
      entityId: jwkId,
      metadata: {
        success: true,
        keyId: jwk.keyId,
        deletedBy: {
          id: userId,
          email: userEmail,
        },
      },
      retention: 'CRITICAL',
    })

    return createSuccessResponse<IDeleteJWKResponse>(event, 'JWK deleted successfully', {
      jwk: {
        id: jwk.id,
        keyId: jwk.keyId,
      },
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})

defineRouteMeta({
  openAPI: {
    summary: 'Delete a JWK',
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
