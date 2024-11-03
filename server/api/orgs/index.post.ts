import { typeid } from 'typeid-js'
import { OrganizationSchema } from '~/database/schemas/organization'

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
  const payload = event.context.auth.payload
  const db = event.context.db
  const now = Math.floor(Date.now() / 1000)

  try {
    const body = await requireValidatedBody(event, CreateOrgSchema)

    // Check existing organization
    const existingOrg = await db
      .selectFrom('organizations')
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
        setResponseStatus(event, 409)
        return createErrorResponse(409, `Organization slug '${body.slug}' is already taken`)
      }
      if (existingOrg.name === body.name) {
        setResponseStatus(event, 409)
        return createErrorResponse(409, `Organization name '${body.name}' is not available`)
      }
      if (existingOrg.email === body.email) {
        setResponseStatus(event, 409)
        return createErrorResponse(409, `Organization email '${body.email}' is already registered`)
      }
    }

    // Create organization with owner
    const orgId = typeid('org').toString()
    const memberId = typeid('mem').toString()

    await db.transaction().execute(async (trx) => {
      // Create organization
      await trx
        .insertInto('organizations')
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
        .insertInto('members')
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
      .selectFrom('organizations')
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

    return {
      status: 200,
      success: true,
      message: 'Organization created successfully',
      data: {
        ...org,
        settings: org.settings,
        metadata: org.metadata,
        isVerified: Boolean(org.isVerified),
        createdAt: toISOString(org.createdAt),
        updatedAt: toISOString(org.updatedAt),
      },
    }
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
