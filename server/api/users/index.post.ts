import { z } from 'zod'

const userRequestSchema = z.object({
  name: z.string({ message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
})

export default defineEventHandler(async (event) => {
  try {
    const parseBody = await readValidatedBody(event, (body) => userRequestSchema.safeParse(body))

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
    return {
      statusCode: 400,
      message: error.message,
    }
  }
})
