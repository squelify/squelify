import { MemberSchema } from '~/database/schemas/member'

export const CreateMemberSchema = MemberSchema.pick({
  userId: true,
  role: true,
  title: true,
  department: true,
}).partial({
  title: true,
  department: true,
})

export default defineEventHandler(async (event) => {
  try {
    const body = await requireValidatedBody(event, CreateMemberSchema)
    logger.debug('[app]', 'Create member payload:', body)

    return { message: 'Not yet implemented' }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
