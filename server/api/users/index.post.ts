import { z } from 'zod'

const CreateUserRequestSchema = z.object({
  token: z.string({ message: 'First name is required' }),
  lastName: z.string({ message: 'Last name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string({ message: 'Password is required' }),
})

export default defineEventHandler(async (event) => {
  try {
    const parseBody = await readValidatedBody(event, (body) =>
      CreateUserRequestSchema.safeParse(body)
    )

    if (!parseBody.success) {
      return createErrorResponse(400, 'Invalid request', {
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
