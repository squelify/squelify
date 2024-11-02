export default defineEventHandler(async (event) => {
  const db = event.context.db
  const orgId = event.context.params.id
  const memberId = event.context.params.id
  const userId = event.context.auth.payload.sub
  const userEmail = event.context.auth.payload.email

  try {
    // Get member record with role info
    const targetMember = await db
      .selectFrom('members')
      .where('id', '=', memberId)
      .where('organizationId', '=', orgId)
      .select(['id', 'userId', 'role', 'isDefault'])
      .executeTakeFirst()

    if (!targetMember) {
      setResponseStatus(event, 404)
      return createErrorResponse(404, 'Member not found')
    }

    // Get requester's role
    const requesterMember = await db
      .selectFrom('members')
      .where('organizationId', '=', orgId)
      .where('userId', '=', userId)
      .select(['id', 'role'])
      .executeTakeFirst()

    if (!requesterMember) {
      await auditLog(event, {
        action: 'delete',
        entity: 'member',
        entityId: memberId,
        metadata: {
          success: false,
          reason: 'not_member',
          organizationId: orgId,
          deletedBy: {
            id: userId,
            email: userEmail,
          },
        },
      })

      setResponseStatus(event, 403)
      return createErrorResponse(403, 'You are not a member of this organization')
    }

    // Only owner and admin can remove members
    if (!['owner', 'admin'].includes(requesterMember.role)) {
      await auditLog(event, {
        action: 'delete',
        entity: 'member',
        entityId: memberId,
        metadata: {
          success: false,
          reason: 'insufficient_permission',
          organizationId: orgId,
          deletedBy: {
            id: userId,
            email: userEmail,
          },
        },
      })

      setResponseStatus(event, 403)
      return createErrorResponse(403, 'Insufficient permission to remove members')
    }

    // Admin cannot remove owner
    if (requesterMember.role === 'admin' && targetMember.role === 'owner') {
      await auditLog(event, {
        action: 'delete',
        entity: 'member',
        entityId: memberId,
        metadata: {
          success: false,
          reason: 'cannot_remove_owner',
          organizationId: orgId,
          deletedBy: {
            id: userId,
            email: userEmail,
          },
        },
      })

      setResponseStatus(event, 403)
      return createErrorResponse(403, 'Admin cannot remove organization owner')
    }

    // Delete member
    await db
      .deleteFrom('members')
      .where('id', '=', memberId)
      .where('organizationId', '=', orgId)
      .execute()

    // Log successful removal
    await auditLog(event, {
      action: 'delete',
      entity: 'member',
      entityId: memberId,
      metadata: {
        success: true,
        organizationId: orgId,
        memberRole: targetMember.role,
        deletedBy: {
          id: userId,
          email: userEmail,
        },
      },
    })

    return {
      status: 200,
      success: true,
      message: 'Member removed successfully',
      data: {
        memberId: targetMember.id,
        organizationId: orgId,
      },
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
