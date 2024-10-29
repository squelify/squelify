import { z } from 'zod'
import { MemberSchema } from '~/database/schemas/member'

const InviteMemberSchema = MemberSchema.pick({
  role: true,
  title: true,
  department: true,
})
  .extend({ email: z.string().email('Email tidak valid') })
  .partial({ title: true, department: true })

export default defineEventHandler(async (event) => {
  try {
    const body = await requireValidatedBody(event, InviteMemberSchema)
    logger.debug('[app]', 'Invite member payload:', body)

    return { message: 'Not yet implemented' }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
