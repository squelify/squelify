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
  try {
    const body = await requireValidatedBody(event, UpdateOrgSchema)
    logger.debug('[app]', 'Update organization payload:', body)

    return { message: 'Not yet implemented' }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
