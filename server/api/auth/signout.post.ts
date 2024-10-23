import { z } from 'zod'

const QueryParamSchema = z.object({
  session_id: z.string({ message: 'Session ID is required' }),
})

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { session_id } = QueryParamSchema.parse(query)

    deleteCookie(event, 'auth_session')

    return { session_id }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
