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

  try {
    const body = await requireValidatedBody(event, CreateOrgSchema)
    const now = Math.floor(Date.now() / 1000)

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
        return createErrorResponse(409, `Slug organisasi '${body.slug}' sudah digunakan`)
      }
      if (existingOrg.name === body.name) {
        setResponseStatus(event, 409)
        return createErrorResponse(409, `Nama organisasi '${body.name}' tidak tersedia`)
      }
      if (existingOrg.email === body.email) {
        setResponseStatus(event, 409)
        return createErrorResponse(409, `Email organisasi '${body.email}' sudah terdaftar`)
      }
    }

    // Create organization
    const org = await db
      .insertInto('organizations')
      .values({
        id: typeid('org').toString(),
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        logoUrl: body.logoUrl || null,
        website: body.website || null,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        status: 'active',
        settings: '{}',
        metadata: '{}',
        isVerified: 0,
        createdBy: payload.sub,
        createdAt: now,
      })
      .returningAll()
      .executeTakeFirst()

    // Transform response data
    const organization = {
      ...org,
      isVerified: Boolean(org.isVerified),
      createdAt: new Date(org.createdAt * 1000).toISOString(),
      updatedAt: org.updatedAt ? new Date(org.updatedAt * 1000).toISOString() : null,
    }

    return {
      status: 200,
      success: true,
      message: 'Organisasi berhasil dibuat',
      data: organization,
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
