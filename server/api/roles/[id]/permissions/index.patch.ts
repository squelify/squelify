import { z } from 'zod'
import { PermissionSchema } from '~/database/schemas/permission'

const UpdateRolePermissionsSchema = PermissionSchema.pick({
  id: true,
}).extend({
  permissions: z.array(z.string()),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await requireValidatedBody(event, UpdateRolePermissionsSchema)
    logger.debug('[app]', 'Update role permissions payload:', body)
    return { message: 'Not yet implemented' }
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
