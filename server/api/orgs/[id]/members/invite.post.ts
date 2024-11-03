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
  const userId = event.context.auth.payload.sub
  const userEmail = event.context.auth.payload.email
  const now = Math.floor(Date.now() / 1000)

  try {
    const body = await requireValidatedBody(event, InviteMemberSchema)

    // Verify organization exists
    const org = await db
      .selectFrom('organizations')
      .where('id', '=', orgId)
      .select(['id', 'name', 'status'])
      .executeTakeFirst()

    if (!org) {
      return createErrorResponse(event, 'Organization not found', 404)
    }

    // Verify requester is an owner or admin
    const requester = await db
      .selectFrom('members')
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
      })

      return createErrorResponse(event, 'Only owners or admins can invite members', 403)
    }

    // Admin cannot invite owners
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
      })

      return createErrorResponse(event, 'Administrators cannot invite organization owners', 403)
    }

    // Check existing invitation
    const existingInvite = await db
      .selectFrom('invitations')
      .where('organizationId', '=', orgId)
      .where('email', '=', body.email)
      .where('status', '=', 'pending')
      .select(['id'])
      .executeTakeFirst()

    if (existingInvite) {
      return createErrorResponse(event, 'An invitation has already been sent to this email', 409)
    }

    // Create invitation
    const inviteId = typeid('inv').toString()
    const invitation = await db
      .insertInto('invitations')
      .values({
        id: inviteId,
        organizationId: orgId,
        email: body.email,
        role: (body.role as InvitationRole) || 'org:member',
        token: typeid('tok').toString(),
        invitedBy: userId,
        status: 'pending',
        expiresAt: now + 7 * 24 * 60 * 60, // 7 days
        metadata: JSON.stringify({
          title: body.title,
          department: body.department,
        }),
        createdAt: now,
      })
      .returning(['id', 'email', 'role', 'token', 'status', 'expiresAt', 'metadata'])
      .executeTakeFirst()

    // Log invitation
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
