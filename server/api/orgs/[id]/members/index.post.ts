import { typeid } from 'typeid-js'
import { MemberSchema } from '~/database/schemas/member'

export interface ICreateMemberResponse {
  member: {
    id: string
    role: string
    title: string | null
    department: string | null
    isDefault: boolean
    invitedAt: string
    joinedAt: string
    user: {
      id: string
      email: string
      firstName: string
      lastName: string | null
    }
  }
}

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
  const userId = event.context.auth?.payload.sub
  const userEmail = event.context.auth?.payload.email
  const now = Math.floor(Date.now() / 1000)

  try {
    const body = await requireValidatedBody(event, CreateMemberSchema)

    // Verify organization exists
    const org = await db
      .selectFrom('sq_organizations')
      .where('id', '=', orgId)
      .select(['id', 'name', 'status'])
      .executeTakeFirst()

    if (!org) {
      return createErrorResponse(event, 'Organization not found', 404)
    }

    // Verify requester is an owner or admin
    const requester = await db
      .selectFrom('sq_members')
      .where('organizationId', '=', orgId)
      .where('userId', '=', userId)
      .where('role', 'in', ['org:owner', 'org:admin'])
      .select(['id', 'role'])
      .executeTakeFirst()

    if (!requester) {
      await auditLog(event, {
        action: 'create',
        entity: 'org:member',
        entityId: orgId,
        metadata: {
          success: false,
          reason: 'unauthorized_creation',
          organizationName: org.name,
          createdBy: {
            id: userId,
            email: userEmail,
          },
        },
      })

      return createErrorResponse(event, 'Only owners or admins can add members', 403)
    }

    // Admin cannot add owners
    if (requester.role === 'org:admin' && body.role === 'org:owner') {
      await auditLog(event, {
        action: 'create',
        entity: 'org:member',
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

      return createErrorResponse(event, 'Administrators cannot add organization owners', 403)
    }

    // Check if user is already a member
    const existingMember = await db
      .selectFrom('sq_members')
      .where('organizationId', '=', orgId)
      .where('userId', '=', body.userId)
      .select(['id'])
      .executeTakeFirst()

    if (existingMember) {
      return createErrorResponse(event, 'User is already a member of this organization', 409)
    }

    // Create member
    const memberId = typeid('mem').toString()
    await db
      .insertInto('sq_members')
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
      .execute()

    // Get member with user info
    const memberWithUser = await db
      .selectFrom('sq_members as m')
      .innerJoin('sq_users as u', 'u.id', 'm.userId')
      .leftJoin('sq_emails as e', (join) =>
        join.onRef('e.userId', '=', 'u.id').on('e.isPrimary', '=', 1)
      )
      .where('m.id', '=', memberId)
      .select([
        'm.id',
        'm.role',
        'm.title',
        'm.department',
        'm.isDefault',
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
      entity: 'org:member',
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

    return createSuccessResponse<ICreateMemberResponse>(event, 'Member added successfully', {
      member: {
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
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
