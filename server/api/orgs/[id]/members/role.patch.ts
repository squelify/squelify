import { z } from 'zod'
import { MemberSchema } from '~/database/schemas/member'

export interface IUpdateMemberRoleResponse {
  member: {
    id: string
    role: string
    user: {
      id: string
      email: string
      firstName: string
      lastName: string | null
    }
    updatedAt: string
  }
}

const UpdateMemberRoleSchema = MemberSchema.pick({
  role: true,
}).extend({
  memberId: z.string().min(1, 'Member ID is required'),
})

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const orgId = event.context.params.id
  const userId = event.context.auth?.payload.sub
  const userEmail = event.context.auth?.payload.email
  const now = Math.floor(Date.now() / 1000)

  try {
    const body = await requireValidatedBody(event, UpdateMemberRoleSchema)

    // Get organization and target member in one query
    const [org, member] = await Promise.all([
      db
        .selectFrom('sq_organizations')
        .where('id', '=', orgId)
        .select(['id', 'name', 'status'])
        .executeTakeFirst(),

      db
        .selectFrom('sq_members as m')
        .innerJoin('sq_users as u', 'u.id', 'm.userId')
        .leftJoin('sq_emails as e', (join) =>
          join.onRef('e.userId', '=', 'u.id').on('e.isPrimary', '=', 1)
        )
        .where('m.id', '=', body.memberId)
        .select([
          'm.id',
          'm.organizationId',
          'm.role',
          'u.id as userId',
          'u.firstName',
          'u.lastName',
          'e.email',
        ])
        .executeTakeFirst(),
    ])

    if (!org) {
      return createErrorResponse(event, 'Organization not found', 404)
    }

    if (!member) {
      return createErrorResponse(event, 'Member not found', 404)
    }

    // Verify member belongs to this organization
    if (member.organizationId !== orgId) {
      await auditLog(event, {
        action: 'update',
        entity: 'org:member',
        entityId: body.memberId,
        metadata: {
          success: false,
          reason: 'member_not_in_organization',
          organizationName: org.name,
          memberId: body.memberId,
          updatedBy: {
            id: userId,
            email: userEmail,
          },
        },
      })

      return createErrorResponse(event, 'Member not found in this organization', 404)
    }

    // Check organization status
    if (org.status === 'suspended') {
      await auditLog(event, {
        action: 'update',
        entity: 'org:member',
        entityId: body.memberId,
        metadata: {
          success: false,
          reason: 'organization_suspended',
          organizationName: org.name,
          updatedBy: {
            id: userId,
            email: userEmail,
          },
        },
      })

      return createErrorResponse(event, 'Cannot update roles in suspended organization', 400)
    }

    // Verify requester is an owner
    const requester = await db
      .selectFrom('sq_members')
      .where('organizationId', '=', orgId)
      .where('userId', '=', userId)
      .where('role', '=', 'org:owner')
      .select(['id'])
      .executeTakeFirst()

    if (!requester) {
      await auditLog(event, {
        action: 'update',
        entity: 'org:member',
        entityId: body.memberId,
        metadata: {
          success: false,
          reason: 'unauthorized_update',
          organizationName: org.name,
          updatedBy: {
            id: userId,
            email: userEmail,
          },
        },
      })

      return createErrorResponse(event, 'Only organization owners can update member roles', 403)
    }

    // If downgrading from owner, check if there are other owners
    if (member.role === 'org:owner' && body.role !== 'org:owner') {
      const ownerCount = await db
        .selectFrom('sq_members')
        .where('organizationId', '=', orgId)
        .where('role', '=', 'org:owner')
        .select((eb) => eb.fn.count<number>('id').as('count'))
        .executeTakeFirst()

      if (ownerCount && Number(ownerCount.count) <= 1) {
        await auditLog(event, {
          action: 'update',
          entity: 'org:member',
          entityId: body.memberId,
          metadata: {
            success: false,
            reason: 'last_owner',
            organizationName: org.name,
            updatedBy: {
              id: userId,
              email: userEmail,
            },
          },
        })

        return createErrorResponse(event, 'Cannot remove the last owner', 400)
      }
    }

    // Update member role
    const updatedMember = await db
      .updateTable('sq_members')
      .set({ role: body.role, updatedAt: now })
      .where('id', '=', member.id)
      .returning(['id', 'role', 'updatedAt'])
      .executeTakeFirst()

    // Log role update
    await auditLog(event, {
      action: 'update',
      entity: 'org:member',
      entityId: member.id,
      metadata: {
        success: true,
        organizationId: orgId,
        organizationName: org.name,
        previousRole: member.role,
        newRole: body.role,
        targetUser: {
          id: member.userId,
          email: member.email,
        },
        updatedBy: {
          id: userId,
          email: userEmail,
        },
      },
    })

    return createSuccessResponse<IUpdateMemberRoleResponse>(
      event,
      'Member role updated successfully',
      {
        member: {
          id: member.id,
          role: updatedMember.role,
          user: {
            id: member.userId,
            email: member.email,
            firstName: member.firstName,
            lastName: member.lastName,
          },
          updatedAt: toISOString(updatedMember.updatedAt),
        },
      }
    )
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
