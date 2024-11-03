import { RoleSchema } from '~/database/schemas/role'

const UpdateRoleSchema = RoleSchema.pick({
  name: true,
  description: true,
  type: true,
  organizationId: true,
  metadata: true,
}).partial()

export default defineEventHandler(async (event) => {
  try {
    const body = await requireValidatedBody(event, UpdateRoleSchema)
    logger.debug('[app]', 'Update role payload:', body)
    return { message: 'Not yet implemented' }
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
