import { typeid } from 'typeid-js'
import { RoleSchema } from '~/database/schemas/role'

export const CreateRoleSchema = RoleSchema.pick({
  name: true,
  description: true,
  type: true,
  organizationId: true,
  metadata: true,
})
  .partial({
    description: true,
    organizationId: true,
    metadata: true,
  })
  .transform((data) => ({
    ...data,
    metadata: data.metadata ? JSON.stringify(data.metadata) : '{}',
  }))

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const userId = event.context.auth.payload.sub
  const userEmail = event.context.auth.payload.email
  const now = Math.floor(Date.now() / 1000)

  try {
    const body = await requireValidatedBody(event, CreateRoleSchema)

    // If organization role, verify organization exists and user permission
    if (body.type === 'organization' && body.organizationId) {
      const [org, member] = await Promise.all([
        db
          .selectFrom('organizations')
          .where('id', '=', body.organizationId)
          .select(['id', 'name', 'status'])
          .executeTakeFirst(),

        db
          .selectFrom('members')
          .where('organizationId', '=', body.organizationId)
          .where('userId', '=', userId)
          .where('role', '=', 'owner')
          .select(['id'])
          .executeTakeFirst(),
      ])

      if (!org) {
        setResponseStatus(event, 404)
        return createErrorResponse(404, 'Organization not found')
      }

      if (org.status === 'suspended') {
        setResponseStatus(event, 400)
        return createErrorResponse(400, 'Cannot create role for suspended organization')
      }

      if (!member) {
        await auditLog(event, {
          action: 'create',
          entity: 'role',
          entityId: body.organizationId,
          metadata: {
            success: false,
            reason: 'not_owner',
            organizationName: org.name,
            createdBy: {
              id: userId,
              email: userEmail,
            },
          },
        })

        setResponseStatus(event, 403)
        return createErrorResponse(403, 'Only organization owner can create roles')
      }
    }

    // Check for duplicate role name in same scope
    const existingRole = await db
      .selectFrom('roles')
      .where('name', '=', body.name)
      .where((eb) => {
        if (body.type === 'organization' && body.organizationId) {
          return eb('organizationId', '=', body.organizationId)
        }
        return eb('type', '=', body.type)
      })
      .select(['id', 'name'])
      .executeTakeFirst()

    if (existingRole) {
      setResponseStatus(event, 409)
      return createErrorResponse(409, `Role '${body.name}' already exists`)
    }

    // Create role
    const role = await db
      .insertInto('roles')
      .values({
        id: typeid('rol').toString(),
        name: body.name,
        description: body.description || null,
        type: body.type,
        organizationId: body.organizationId || null,
        isDefault: 0,
        metadata: body.metadata || '{}',
        createdAt: now,
      })
      .returning([
        'id',
        'name',
        'description',
        'type',
        'organizationId',
        'isDefault',
        'metadata',
        'createdAt',
      ])
      .executeTakeFirst()

    // Log role creation
    await auditLog(event, {
      action: 'create',
      entity: 'role',
      entityId: role.id,
      metadata: {
        success: true,
        roleName: role.name,
        roleType: role.type,
        organizationId: role.organizationId,
        createdBy: {
          id: userId,
          email: userEmail,
        },
      },
    })

    return {
      status: 200,
      success: true,
      message: 'Role created successfully',
      data: {
        ...role,
        isDefault: Boolean(role.isDefault),
        metadata: JSON.parse(role.metadata),
        createdAt: toISOString(role.createdAt),
      },
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
