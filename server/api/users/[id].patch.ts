import { UserSchema } from '~/database/schemas/user'

const UpdateUserSchema = UserSchema.pick({
  firstName: true,
  lastName: true,
  username: true,
  avatarUrl: true,
  locale: true,
}).partial()

export default defineEventHandler(async (event) => {
  try {
    const body = await requireValidatedBody(event, UpdateUserSchema)
    logger.debug('[app]', 'Update user payload:', body)

    return { message: 'Not yet implemented' }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
