export interface IDeleteOrganizationResponse {
  organization: {
    id: string
    name: string
    slug: string
    createdBy: string
  }
}

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const orgId = event.context.params.id
  const userId = event.context.auth.payload.sub
  const userEmail = event.context.auth.payload.email

  try {
    // Get organization with complete status check
    const org = await db
      .selectFrom('sq_organizations')
      .where('id', '=', orgId)
      .select(['id', 'name', 'slug', 'status', 'isVerified', 'createdBy'])
      .executeTakeFirst()

    if (!org) {
      return createErrorResponse(event, 'Organization not found', 404)
    }

    // Verify user is an owner
    const member = await db
      .selectFrom('sq_members')
      .where('organizationId', '=', orgId)
      .where('userId', '=', userId)
      .where('role', '=', 'org:owner')
      .select(['id'])
      .executeTakeFirst()

    if (!member) {
      await auditLog(event, {
        action: 'delete',
        entity: 'organization',
        entityId: org.id,
        metadata: {
          success: false,
          reason: 'unauthorized_deletion',
          organizationName: org.name,
          organizationSlug: org.slug,
          deletedBy: {
            id: userId,
            email: userEmail,
          },
        },
      })

      return createErrorResponse(event, 'Only organization owners can delete organization', 403)
    }

    // Check if organization is suspended
    if (org.status === 'suspended') {
      await auditLog(event, {
        action: 'delete',
        entity: 'organization',
        entityId: org.id,
        metadata: {
          success: false,
          reason: 'organization_suspended',
          organizationName: org.name,
          organizationSlug: org.slug,
          deletedBy: {
            id: userId,
            email: userEmail,
          },
        },
      })

      return createErrorResponse(event, 'Cannot delete suspended organization', 400)
    }

    // Count organization members
    const memberCount = await db
      .selectFrom('sq_members')
      .where('organizationId', '=', orgId)
      .select(({ fn }) => [fn.count<number>('id').as('count')])
      .executeTakeFirst()

    if (memberCount && Number(memberCount.count) <= 1) {
      await auditLog(event, {
        action: 'delete',
        entity: 'organization',
        entityId: org.id,
        metadata: {
          success: false,
          reason: 'single_member',
          organizationName: org.name,
          organizationSlug: org.slug,
          deletedBy: {
            id: userId,
            email: userEmail,
          },
        },
      })

      return createErrorResponse(event, 'Cannot delete organization with single member', 400)
    }

    // Hard delete organization and related data
    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom('sq_members').where('organizationId', '=', orgId).execute()
      await trx.deleteFrom('sq_organizations').where('id', '=', orgId).execute()
    })

    // Log successful deletion
    await auditLog(event, {
      action: 'delete',
      entity: 'organization',
      entityId: org.id,
      metadata: {
        success: true,
        organizationName: org.name,
        organizationSlug: org.slug,
        createdBy: org.createdBy,
        deletedBy: {
          id: userId,
          email: userEmail,
        },
      },
    })

    return createSuccessResponse<IDeleteOrganizationResponse>(
      event,
      'Organization deleted successfully',
      {
        organization: {
          id: org.id,
          name: org.name,
          slug: org.slug,
          createdBy: org.createdBy,
        },
      }
    )
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
