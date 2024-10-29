import * as jose from 'jose'
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
  description: z.string().optional().nullable(),
  logoUrl: z.string().url('URL logo tidak valid').optional().nullable(),
  website: z.string().url('URL website tidak valid').optional().nullable(),
  email: z.string().email('Email tidak valid').optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
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
        return createErrorResponse(409, `Slug organisasi '${body.slug}' sudah digunakan`)
      }
      if (existingOrg.name === body.name) {
        return createErrorResponse(409, `Nama organisasi '${body.name}' tidak tersedia`)
      }
      if (existingOrg.email === body.email) {
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
