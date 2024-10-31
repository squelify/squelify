import { RoleSchema } from '~/database/schemas/role'

export const CreateRoleSchema = RoleSchema.pick({
  name: true,
  description: true,
  type: true,
  organizationId: true,
  metadata: true,
}).partial({
  description: true,
  organizationId: true,
  metadata: true,
})

export default defineEventHandler(async (event) => {
  try {
    const body = await requireValidatedBody(event, CreateRoleSchema)
    logger.debug('[app]', 'Create role payload:', body)

    return { message: 'Not yet implemented' }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
