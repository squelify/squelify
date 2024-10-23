import { z } from 'zod'

export const LoginRequestSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string({ message: 'Password is required' }),
})

export default defineEventHandler(async (event) => {
  try {
    const parseBody = await readValidatedBody(event, (body) => LoginRequestSchema.safeParse(body))

    if (!parseBody.success) {
      return createErrorResponse(400, 'Invalid user input', {
        issues: parseBody.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    // await sendJSXEmail<OtpCodeProps>('otp-code', 'user@example.com', {
    //   name: 'John Doe',
    //   email: 'user@example.com',
    //   otp: '123456',
    // })

    const hashedPassword = await hashPassword(parseBody.data.password)

    return { ...parseBody.data, password: hashedPassword }
  } catch (error) {
    return { statusCode: 400, message: error.message }
  }
})
