import { OrganizationSchema } from '~/database/schemas/organization'

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
    // Validate update payload
    const body = await requireValidatedBody(event, UpdateOrgSchema)

    // Get organization and verify existence
    const org = await db
      .selectFrom('organizations')
      .where('id', '=', orgId)
      .select(['id', 'name', 'status'])
      .executeTakeFirst()

    if (!org) {
      setResponseStatus(event, 404)
      return createErrorResponse(404, 'Organization not found')
    }

    // Verify user is an owner
    const member = await db
      .selectFrom('members')
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
          reason: 'not_owner',
          organizationName: org.name,
          updatedBy: {
            id: userId,
            email: userEmail,
          },
        },
      })

      setResponseStatus(event, 403)
      return createErrorResponse(403, 'Only organization owner can update organization')
    }

    // Update organization
    const updatedOrg = await db
      .updateTable('organizations')
      .set({
        ...body,
        updatedAt: now,
      })
      .where('id', '=', orgId)
      .returning([
        'id',
        'name',
        'slug',
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

    return {
      status: 200,
      success: true,
      message: 'Organization updated successfully',
      data: {
        ...updatedOrg,
        settings: updatedOrg.settings,
        metadata: updatedOrg.metadata,
        isVerified: Boolean(updatedOrg.isVerified),
        updatedAt: toISOString(updatedOrg.updatedAt),
      },
    }
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
