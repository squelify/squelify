import { typeid } from 'typeid-js'
import { z } from 'zod'

const CreateOrgSchema = z.object({
  name: z.string().min(3, 'Nama organisasi minimal 3 karakter'),
  slug: z
    .string()
    .min(3, 'Slug minimal 3 karakter')
    .max(50, 'Slug maksimal 50 karakter')
    .regex(/^[a-z]/, 'Slug harus diawali huruf kecil')
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung')
    .regex(/[a-z0-9]$/, 'Slug harus diakhiri huruf atau angka')
    .regex(/^[^-].*[^-]$/, 'Slug tidak boleh diawali atau diakhiri tanda hubung')
    .regex(/^[^0-9]/, 'Slug tidak boleh diawali angka')
    .regex(/^(?!.*--).+$/, 'Slug tidak boleh mengandung tanda hubung berurutan'),
  description: z.string().optional(),
  logoUrl: z.string().url('URL logo tidak valid').optional(),
  website: z.string().url('URL website tidak valid').optional(),
  email: z.string().email('Email tidak valid').optional(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
})

export default defineEventHandler(async (event) => {
  try {
    const db = event.context.db
    const now = Math.floor(Date.now() / 1000)

    // Validate request body
    const body = await readValidatedBody(event, (body) => CreateOrgSchema.safeParse(body))
    if (!body.success) {
      return createErrorResponse(400, 'Invalid request', {
        issues: body.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    // Check existing organization
    const existingOrg = await db
      .selectFrom('organizations')
      .where((eb) =>
        eb.or([
          eb('slug', '=', body.data.slug),
          eb('name', '=', body.data.name),
          eb.and([eb('email', 'is not', null), eb('email', '=', body.data.email || '')]),
        ])
      )
      .select(['id', 'name', 'slug', 'email'])
      .executeTakeFirst()

    if (existingOrg) {
      if (existingOrg.slug === body.data.slug) {
        return createErrorResponse(409, `Slug organisasi '${body.data.slug}' sudah digunakan`)
      }
      if (existingOrg.name === body.data.name) {
        return createErrorResponse(409, `Nama organisasi '${body.data.name}' tidak tersedia`)
      }
      if (existingOrg.email === body.data.email) {
        return createErrorResponse(409, `Email organisasi '${body.data.email}' sudah terdaftar`)
      }
    }

    // Create organization
    const org = await db
      .insertInto('organizations')
      .values({
        id: typeid('org').toString(),
        name: body.data.name,
        slug: body.data.slug,
        description: body.data.description || null,
        logoUrl: body.data.logoUrl || null,
        website: body.data.website || null,
        email: body.data.email || null,
        phone: body.data.phone || null,
        address: body.data.address || null,
        status: 'active',
        settings: '{}',
        metadata: '{}',
        isVerified: 0,
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
