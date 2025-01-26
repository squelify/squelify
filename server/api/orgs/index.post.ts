import { typeid } from 'typeid-js'
import { OrganizationSchema } from '~/database/schemas/organization'

export interface ICreateOrganizationResponse {
  organization: {
    id: string
    name: string
    slug: string
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
    createdAt: string
    updatedAt: string | null
  }
}

export const CreateOrgSchema = OrganizationSchema.pick({
  name: true,
  slug: true,
  description: true,
  logoUrl: true,
  website: true,
  email: true,
  phone: true,
  address: true,
}).partial({
  description: true,
  logoUrl: true,
  website: true,
  email: true,
  phone: true,
  address: true,
})

export default defineEventHandler(async (event) => {
  const payload = event.context.auth?.payload
  const db = event.context.db
  const now = Math.floor(Date.now() / 1000)

  try {
    const body = await requireValidatedBody(event, CreateOrgSchema)

    // Check existing organization
    const existingOrg = await db
      .selectFrom('_sq_organizations')
      .where((eb) =>
        eb.or([
          eb('slug', '=', body.slug),
          eb('name', '=', body.name),
          eb.and([eb('email', 'is not', null), eb('email', '=', body.email || '')]),
        ])
      )
      .select(['id', 'name', 'slug', 'email'])
      .executeTakeFirst()

    if (existingOrg) {
      if (existingOrg.slug === body.slug) {
        return createErrorResponse(event, `Organization slug '${body.slug}' is already taken`, 409)
      }
      if (existingOrg.name === body.name) {
        return createErrorResponse(event, `Organization name '${body.name}' is not available`, 409)
      }
      if (existingOrg.email === body.email) {
        return createErrorResponse(
          event,
          `Organization email '${body.email}' is already registered`,
          409
        )
      }
    }

    // Create organization with owner
    const orgId = typeid('org').toString()
    const memberId = typeid('mem').toString()

    await db.transaction().execute(async (trx) => {
      // Create organization
      await trx
        .insertInto('_sq_organizations')
        .values({
          id: orgId,
          name: body.name,
          slug: body.slug,
          description: body.description || null,
          logoUrl: body.logoUrl || null,
          website: body.website || null,
          email: body.email || null,
          phone: body.phone || null,
          address: body.address || null,
          status: 'active',
          settings: JSON.stringify({}),
          metadata: JSON.stringify({}),
          isVerified: 0,
          createdBy: payload.sub,
          createdAt: now,
        })
        .execute()

      // Create owner member
      await trx
        .insertInto('_sq_members')
        .values({
          id: memberId,
          organizationId: orgId,
          userId: payload.sub,
          role: 'org:owner',
          isDefault: 1,
          joinedAt: now,
          createdAt: now,
        })
        .execute()
    })

    // Get created organization
    const org = await db
      .selectFrom('_sq_organizations')
      .where('id', '=', orgId)
      .selectAll()
      .executeTakeFirst()

    // Log organization creation
    await auditLog(event, {
      action: 'create',
      entity: 'organization',
      entityId: orgId,
      metadata: {
        success: true,
        organizationName: org.name,
        organizationSlug: org.slug,
        createdBy: {
          id: payload.sub,
          email: payload.email,
        },
      },
    })

    return createSuccessResponse<ICreateOrganizationResponse>(
      event,
      'Organization created successfully',
      {
        organization: {
          ...org,
          settings: JSON.parse(org.settings),
          metadata: JSON.parse(org.metadata),
          isVerified: Boolean(org.isVerified),
          createdAt: toISOString(org.createdAt),
          updatedAt: toISOString(org.updatedAt),
        },
      }
    )
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})

defineRouteMeta({
  openAPI: {
    summary: 'Create Organization',
    tags: ['Organization'],
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
