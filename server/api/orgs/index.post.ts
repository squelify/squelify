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
  try {
    const db = event.context.db
    const now = Math.floor(Date.now() / 1000)
    const token = getRequestHeader(event, 'Authorization')?.replace('Bearer ', '')

    if (!token) {
      return createErrorResponse(401, 'Unauthorized')
    }

    // Extract key ID from token header
    const decoded = jose.decodeProtectedHeader(token)
    if (!decoded.kid) {
      return createErrorResponse(401, 'Invalid token format')
    }

    // Get JWK used for signing
    const jwk = await db
      .selectFrom('jwks')
      .where('keyId', '=', decoded.kid)
      .where('isActive', '=', 1)
      .where('expiresAt', '>', now)
      .select(['keyId', 'publicKey', 'algorithm'])
      .executeTakeFirst()

    if (!jwk) {
      return createErrorResponse(401, 'Invalid token signature')
    }

    // Verify token and decode payload
    const payload = await verifyAccessToken(token, jwk)
    if (!payload) {
      return createErrorResponse(401, 'Token tidak valid')
    }

    // Check if session is still valid
    const session = await db
      .selectFrom('sessions')
      .where('id', '=', payload.sid)
      .where('userId', '=', payload.sub)
      .where('isActive', '=', 1)
      .where('expiresAt', '>', now)
      .select(['id'])
      .executeTakeFirst()

    if (!session) {
      return createErrorResponse(401, 'Session tidak valid atau telah berakhir')
    }

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
