import { z } from 'zod'

export const PasswordRecoveryRequestSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
})

export default defineEventHandler(async (event) => {
  try {
    const parseBody = await readValidatedBody(event, (body) =>
      PasswordRecoveryRequestSchema.safeParse(body)
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
