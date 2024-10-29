import { PermissionSchema } from '~/database/schemas/permission'

export const CreatePermissionSchema = PermissionSchema.pick({
  name: true,
  description: true,
  category: true,
  action: true,
  resource: true,
  conditions: true,
}).partial({
  description: true,
  conditions: true,
})

export default defineEventHandler(async (event) => {
  try {
    const body = await requireValidatedBody(event, CreatePermissionSchema)
    logger.debug('[app]', 'Create role permissions payload:', body)
    return { message: 'Not yet implemented' }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
