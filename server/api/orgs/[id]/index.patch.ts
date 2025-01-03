import { OrganizationSchema } from '~/database/schemas/organization'

export interface IUpdateOrganizationResponse {
  organization: {
    id: string
    name: string
    description: string | null
    logoUrl: string | null
    website: string | null
    email: string | null
    phone: string | null
    address: string | null
    status: string
    settings: Record<string, any>
    metadata: Record<string, any>
    isVerified: boolean
    updatedAt: string
  }
}

const UpdateOrgSchema = OrganizationSchema.pick({
  name: true,
  description: true,
  logoUrl: true,
  website: true,
  email: true,
  phone: true,
  address: true,
  status: true,
  settings: true,
  metadata: true,
}).partial()

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const orgId = event.context.params.id
  const userId = event.context.auth.payload.sub
  const userEmail = event.context.auth.payload.email
  const now = Math.floor(Date.now() / 1000)

  try {
    const body = await requireValidatedBody(event, UpdateOrgSchema)

    // Get organization and verify existence
    const org = await db
      .selectFrom('sq_organizations')
      .where('id', '=', orgId)
      .select(['id', 'name', 'status'])
      .executeTakeFirst()

    if (!org) {
      return createErrorResponse(event, 'Organization not found', 404)
    }

    // Verify user is an owner
    const member = await db
      .selectFrom('sq_members')
      .where('organizationId', '=', orgId)
      .where('userId', '=', userId)
      .where('role', '=', 'org:owner')
      .select(['id'])
      .executeTakeFirst()

    if (!member) {
      await auditLog(event, {
        action: 'update',
        entity: 'organization',
        entityId: orgId,
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

      return createErrorResponse(
        event,
        'Only organization owners can update organization details',
        403
      )
    }

    // Update organization
    const updatedOrg = await db
      .updateTable('sq_organizations')
      .set({
        ...body,
        updatedAt: now,
      })
      .where('id', '=', orgId)
      .returning([
        'id',
        'name',
        'description',
        'logoUrl',
        'website',
        'email',
        'phone',
        'address',
        'status',
        'settings',
        'metadata',
        'isVerified',
        'updatedAt',
      ])
      .executeTakeFirst()

    // Log successful update
    await auditLog(event, {
      action: 'update',
      entity: 'organization',
      entityId: orgId,
      metadata: {
        success: true,
        organizationName: org.name,
        changes: body,
        updatedBy: {
          id: userId,
          email: userEmail,
        },
      },
    })

    return createSuccessResponse<IUpdateOrganizationResponse>(
      event,
      'Organization updated successfully',
      {
        organization: {
          ...updatedOrg,
          settings: JSON.parse(updatedOrg.settings),
          metadata: JSON.parse(updatedOrg.metadata),
          isVerified: Boolean(updatedOrg.isVerified),
          updatedAt: toISOString(updatedOrg.updatedAt),
        },
      }
    )
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
