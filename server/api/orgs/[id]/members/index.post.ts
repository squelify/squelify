import { typeid } from 'typeid-js'
import { MemberSchema } from '~/database/schemas/member'

export const CreateMemberSchema = MemberSchema.pick({
  userId: true,
  role: true,
  title: true,
  department: true,
}).partial({
  title: true,
  department: true,
})

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const orgId = event.context.params.id
  const userId = event.context.auth.payload.sub
  const userEmail = event.context.auth.payload.email
  const now = Math.floor(Date.now() / 1000)

  try {
    const body = await requireValidatedBody(event, CreateMemberSchema)

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
      .where('role', 'in', ['owner', 'admin'])
      .select(['id', 'role'])
      .executeTakeFirst()

    if (!requester) {
      await auditLog(event, {
        action: 'create',
        entity: 'member',
        entityId: orgId,
        metadata: {
          success: false,
          reason: 'insufficient_permission',
          organizationName: org.name,
          createdBy: {
            id: userId,
            email: userEmail,
          },
        },
      })

      setResponseStatus(event, 403)
      return createErrorResponse(403, 'Only owner or admin can add members')
    }

    // Admin cannot add owners
    if (requester.role === 'admin' && body.role === 'owner') {
      await auditLog(event, {
        action: 'create',
        entity: 'member',
        entityId: orgId,
        metadata: {
          success: false,
          reason: 'admin_cannot_add_owner',
          organizationName: org.name,
          createdBy: {
            id: userId,
            email: userEmail,
          },
        },
      })

      setResponseStatus(event, 403)
      return createErrorResponse(403, 'Admin cannot add organization owner')
    }

    // Check if user is already a member
    const existingMember = await db
      .selectFrom('members')
      .where('organizationId', '=', orgId)
      .where('userId', '=', body.userId)
      .select(['id'])
      .executeTakeFirst()

    if (existingMember) {
      setResponseStatus(event, 409)
      return createErrorResponse(409, 'User is already a member of this organization')
    }

    // Create member
    const memberId = typeid('mem').toString()
    await db
      .insertInto('members')
      .values({
        id: memberId,
        organizationId: orgId,
        userId: body.userId,
        role: body.role,
        title: body.title || null,
        department: body.department || null,
        isDefault: 0,
        invitedBy: userId,
        invitedAt: now,
        joinedAt: now,
        createdAt: now,
      })
      .returning([
        'id',
        'role',
        'title',
        'department',
        'isDefault',
        'invitedBy',
        'invitedAt',
        'joinedAt',
      ])
      .executeTakeFirst()

    // Get member with user info
    const memberWithUser = await db
      .selectFrom('members as m')
      .innerJoin('users as u', 'u.id', 'm.userId')
      .leftJoin('emails as e', (join) =>
        join.onRef('e.userId', '=', 'u.id').on('e.isPrimary', '=', 1)
      )
      .where('m.id', '=', memberId)
      .select([
        'm.id',
        'm.role',
        'm.title',
        'm.department',
        'm.isDefault',
        'm.invitedBy',
        'm.invitedAt',
        'm.joinedAt',
        'u.id as userId',
        'u.firstName',
        'u.lastName',
        'e.email',
      ])
      .executeTakeFirst()

    // Log member creation
    await auditLog(event, {
      action: 'create',
      entity: 'member',
      entityId: memberId,
      metadata: {
        success: true,
        organizationId: orgId,
        organizationName: org.name,
        memberRole: body.role,
        createdBy: {
          id: userId,
          email: userEmail,
        },
      },
    })

    return {
      status: 200,
      success: true,
      message: 'Member added successfully',
      data: {
        id: memberWithUser.id,
        role: memberWithUser.role,
        title: memberWithUser.title,
        department: memberWithUser.department,
        isDefault: Boolean(memberWithUser.isDefault),
        invitedAt: toISOString(memberWithUser.invitedAt),
        joinedAt: toISOString(memberWithUser.joinedAt),
        user: {
          id: memberWithUser.userId,
          email: memberWithUser.email,
          firstName: memberWithUser.firstName,
          lastName: memberWithUser.lastName,
        },
      },
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
