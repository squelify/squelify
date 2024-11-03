export default defineEventHandler(async (event) => {
  const db = event.context.db
  const orgId = event.context.params.id
  const userId = event.context.auth.payload.sub
  const userEmail = event.context.auth.payload.email

  try {
    // Get organization with complete status check
    const org = await db
      .selectFrom('organizations')
      .where('id', '=', orgId)
      .select(['id', 'name', 'slug', 'status', 'isVerified', 'createdBy'])
      .executeTakeFirst()

    if (!org) {
      setResponseStatus(event, 404)
      return createErrorResponse(404, 'Organization not found')
    }

    // Verify user is an owner
    const member = await db
      .selectFrom('members')
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
          reason: 'not_owner',
          organizationName: org.name,
          organizationSlug: org.slug,
          deletedBy: {
            id: userId,
            email: userEmail,
          },
        },
      })

      setResponseStatus(event, 403)
      return createErrorResponse(403, 'Only organization owner can delete organization')
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

      setResponseStatus(event, 400)
      return createErrorResponse(400, 'Cannot delete suspended organization')
    }

    // Count organization members
    const memberCount = await db
      .selectFrom('members')
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

      setResponseStatus(event, 400)
      return createErrorResponse(400, 'Cannot delete organization with single member')
    }

    // Hard delete organization and related data
    await db.transaction().execute(async (trx) => {
      // Delete organization members first
      await trx.deleteFrom('members').where('organizationId', '=', orgId).execute()

      // Delete organization
      await trx.deleteFrom('organizations').where('id', '=', orgId).execute()
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

    return {
      status: 200,
      success: true,
      message: `Organization ${org.name} deleted successfully`,
      data: {
        id: org.id,
        name: org.name,
        slug: org.slug,
      },
    }
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
