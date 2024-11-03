import { typeid } from 'typeid-js'
import { z } from 'zod'
import { InvitationRole } from '~/database/schemas/invitation'
import { MemberSchema } from '~/database/schemas/member'

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
      setResponseStatus(event, 404)
      return createErrorResponse(404, 'Organization not found')
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
          reason: 'insufficient_permission',
          organizationName: org.name,
          invitedBy: {
            id: userId,
            email: userEmail,
          },
        },
      })

      setResponseStatus(event, 403)
      return createErrorResponse(403, 'Only owner or admin can invite members')
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

      setResponseStatus(event, 403)
      return createErrorResponse(403, 'Admin cannot invite organization owner')
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
      setResponseStatus(event, 409)
      return createErrorResponse(409, 'Invitation already sent to this email')
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

    return {
      status: 200,
      success: true,
      message: 'Invitation sent successfully',
      data: {
        id: invitation.id,
        token: invitation.token,
        email: invitation.email,
        status: invitation.status,
        role: invitation.role,
        metadata: invitation.metadata,
        expiresAt: toISOString(invitation.expiresAt),
      },
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
