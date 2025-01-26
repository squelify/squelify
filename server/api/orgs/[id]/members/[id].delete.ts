export interface IDeleteMemberResponse {
  member: {
    id: string
    organizationId: string
    role: string
  }
}

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const orgId = event.context.params.id
  const memberId = event.context.params.id
  const userId = event.context.auth?.payload.sub
  const userEmail = event.context.auth?.payload.email

  try {
    // Get member record with role info
    const targetMember = await db
      .selectFrom('_sq_members')
      .where('id', '=', memberId)
      .where('organizationId', '=', orgId)
      .select(['id', 'userId', 'role', 'isDefault'])
      .executeTakeFirst()

    if (!targetMember) {
      return createErrorResponse(event, 'Member not found', 404)
    }

    // Get requester's role
    const requesterMember = await db
      .selectFrom('_sq_members')
      .where('organizationId', '=', orgId)
      .where('userId', '=', userId)
      .select(['id', 'role'])
      .executeTakeFirst()

    if (!requesterMember) {
      await auditLog(event, {
        action: 'delete',
        entity: 'org:member',
        entityId: memberId,
        metadata: {
          success: false,
          reason: 'unauthorized_deletion',
          organizationId: orgId,
          deletedBy: {
            id: userId,
            email: userEmail,
          },
        },
      })

      return createErrorResponse(event, 'You are not a member of this organization', 403)
    }

    // Only owner and admin can remove members
    if (!['org:owner', 'org:admin'].includes(requesterMember.role)) {
      await auditLog(event, {
        action: 'delete',
        entity: 'org:member',
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

      return createErrorResponse(event, 'Only owners or admins can remove members', 403)
    }

    // Admin cannot remove owner
    if (requesterMember.role === 'org:admin' && targetMember.role === 'org:owner') {
      await auditLog(event, {
        action: 'delete',
        entity: 'org:member',
        entityId: memberId,
        metadata: {
          success: false,
          reason: 'admin_cannot_remove_owner',
          organizationId: orgId,
          deletedBy: {
            id: userId,
            email: userEmail,
          },
        },
      })

      return createErrorResponse(event, 'Administrators cannot remove organization owners', 403)
    }

    // Delete member
    await db
      .deleteFrom('_sq_members')
      .where('id', '=', memberId)
      .where('organizationId', '=', orgId)
      .execute()

    // Log successful removal
    await auditLog(event, {
      action: 'delete',
      entity: 'org:member',
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

    return createSuccessResponse<IDeleteMemberResponse>(event, 'Member removed successfully', {
      member: {
        id: targetMember.id,
        organizationId: orgId,
        role: targetMember.role,
      },
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
