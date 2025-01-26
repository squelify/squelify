import { typeid } from 'typeid-js'
import { z } from 'zod'
import { InvitationRole } from '~/database/schemas/invitation'
import { MemberSchema } from '~/database/schemas/member'

export interface IInviteMemberResponse {
  invitation: {
    id: string
    token: string
    email: string
    status: string
    role: string
    metadata: Record<string, any>
    expiresAt: string
  }
}

const InviteMemberSchema = MemberSchema.pick({
  role: true,
  title: true,
  department: true,
})
  .extend({ email: z.string().email('Invalid email address') })
  .partial({ title: true, department: true })

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const orgId = event.context.params.id
  const userId = event.context.auth?.payload.sub
  const userEmail = event.context.auth?.payload.email
  const now = Math.floor(Date.now() / 1000)

  try {
    const body = await requireValidatedBody(event, InviteMemberSchema)

    const org = await db
      .selectFrom('_sq_organizations')
      .where('id', '=', orgId)
      .select(['id', 'name', 'status'])
      .executeTakeFirst()

    if (!org) {
      await auditLog(event, {
        action: 'invite',
        entity: 'organization',
        entityId: orgId,
        metadata: {
          success: false,
          reason: 'org_not_found',
          email: body.email,
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Organization not found', 404)
    }

    const requester = await db
      .selectFrom('_sq_members')
      .where('organizationId', '=', orgId)
      .where('userId', '=', userId)
      .where('role', 'in', ['org:owner', 'org:admin'])
      .select(['id', 'role'])
      .executeTakeFirst()

    if (!requester) {
      await auditLog(event, {
        action: 'invite',
        entity: 'organization',
        entityId: orgId,
        metadata: {
          success: false,
          reason: 'unauthorized_invitation',
          organizationName: org.name,
          invitedBy: {
            id: userId,
            email: userEmail,
          },
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Only owners or admins can invite members', 403)
    }

    if (requester.role === 'org:admin' && body.role === 'org:owner') {
      await auditLog(event, {
        action: 'invite',
        entity: 'organization',
        entityId: orgId,
        metadata: {
          success: false,
          reason: 'admin_cannot_invite_owner',
          organizationName: org.name,
          invitedBy: {
            id: userId,
            email: userEmail,
          },
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Administrators cannot invite organization owners', 403)
    }

    const existingInvite = await db
      .selectFrom('_sq_invitations')
      .where('organizationId', '=', orgId)
      .where('email', '=', body.email)
      .where('status', '=', 'pending')
      .select(['id'])
      .executeTakeFirst()

    if (existingInvite) {
      await auditLog(event, {
        action: 'invite',
        entity: 'organization',
        entityId: orgId,
        metadata: {
          success: false,
          reason: 'invitation_exists',
          email: body.email,
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'An invitation has already been sent to this email', 409)
    }

    const inviteId = typeid('inv').toString()
    const invitation = await db
      .insertInto('_sq_invitations')
      .values({
        id: inviteId,
        organizationId: orgId,
        email: body.email,
        role: (body.role as InvitationRole) || 'org:member',
        token: typeid('tok').toString(),
        invitedBy: userId,
        status: 'pending',
        expiresAt: now + DURATION.DAY * 7,
        metadata: JSON.stringify({
          title: body.title,
          department: body.department,
        }),
        createdAt: now,
      })
      .returning(['id', 'email', 'role', 'token', 'status', 'expiresAt', 'metadata'])
      .executeTakeFirst()

    await auditLog(event, {
      action: 'invite',
      entity: 'organization',
      entityId: inviteId,
      metadata: {
        success: true,
        organizationId: orgId,
        organizationName: org.name,
        invitedRole: body.role,
        invitedEmail: body.email,
        invitedBy: {
          id: userId,
          email: userEmail,
        },
      },
      retention: 'CRITICAL',
    })

    return createSuccessResponse<IInviteMemberResponse>(event, 'Invitation sent successfully', {
      invitation: {
        ...invitation,
        metadata: JSON.parse(invitation.metadata),
        expiresAt: toISOString(invitation.expiresAt),
      },
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
