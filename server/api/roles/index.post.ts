import { typeid } from 'typeid-js'
import { RoleSchema } from '~/database/schemas/role'

export interface ICreateRoleResponse {
  role: {
    id: string
    name: string
    description: string | null
    type: string
    organizationId: string | null
    isDefault: boolean
    metadata: Record<string, any>
    createdAt: string
  }
}

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
    metadata: data.metadata ? JSON.stringify(data.metadata) : JSON.stringify({}),
  }))

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const userId = event.context.auth?.payload.sub
  const userEmail = event.context.auth?.payload.email
  const now = Math.floor(Date.now() / 1000)

  try {
    const body = await requireValidatedBody(event, CreateRoleSchema)

    // If organization role, verify organization exists and user permission
    if (body.type === 'organization' && body.organizationId) {
      const [org, member] = await Promise.all([
        db
          .selectFrom('sq_organizations')
          .where('id', '=', body.organizationId)
          .select(['id', 'name', 'status'])
          .executeTakeFirst(),

        db
          .selectFrom('sq_members')
          .where('organizationId', '=', body.organizationId)
          .where('userId', '=', userId)
          .where('role', '=', 'org:owner')
          .select(['id'])
          .executeTakeFirst(),
      ])

      if (!org) {
        return createErrorResponse(event, 'Organization not found', 404)
      }

      if (org.status === 'suspended') {
        return createErrorResponse(event, 'Cannot create role for suspended organization', 400)
      }

      if (!member) {
        await auditLog(event, {
          action: 'create',
          entity: 'role',
          entityId: body.organizationId,
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

        return createErrorResponse(event, 'Only organization owners can create roles', 403)
      }
    }

    // Check for duplicate role name in same scope
    const existingRole = await db
      .selectFrom('sq_roles')
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
      return createErrorResponse(event, `Role '${body.name}' already exists in this scope`, 409)
    }

    // Create role
    const role = await db
      .insertInto('sq_roles')
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

    return createSuccessResponse<ICreateRoleResponse>(event, 'Role created successfully', {
      role: {
        ...role,
        isDefault: Boolean(role.isDefault),
        metadata: JSON.parse(role.metadata),
        createdAt: toISOString(role.createdAt),
      },
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})

defineRouteMeta({
  openAPI: {
    summary: 'Create Role',
    tags: ['Authorization'],
    parameters: [
      {
        in: 'header',
        name: 'Contennt-Type',
        required: true,
        example: 'application/json',
      },
    ],
    responses: {
      200: { $ref: 'resp-ok' },
      400: { $ref: 'resp-bad-request' },
      500: { $ref: 'resp-internal-server-error' },
    },
  },
})
