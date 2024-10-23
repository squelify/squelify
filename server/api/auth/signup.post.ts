import { z } from 'zod'

export const SignupRequestSchema = z.object({
  name: z.string({ message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string({ message: 'Password is required' }),
})

export default defineEventHandler(async (event) => {
  try {
    const parseBody = await readValidatedBody(event, (body) => SignupRequestSchema.safeParse(body))

    if (!parseBody.success) {
      return createErrorResponse(400, 'Invalid user input', {
        issues: parseBody.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    return parseBody.data
  } catch (error) {
    return throwErrorResponse(error, 400)
  }
})
