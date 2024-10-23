import { z } from 'zod'

export const LoginRequestSchema = z.object({
  identity: z.string().email({ message: 'Invalid email address' }),
  password: z.string({ message: 'Password is required' }),
})

export default defineEventHandler(async (event) => {
  try {
    const parseBody = await readValidatedBody(event, (body) => LoginRequestSchema.safeParse(body))

    if (!parseBody.success) {
      return createErrorResponse(400, 'Invalid request', {
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

    // setCookie(event, 'auth_session', hashedPassword, {
    //   httpOnly: true,
    //   secure: isProduction,
    //   sameSite: 'lax',
    //   path: '/',
    //   maxAge: 60 * 60 * 24 * 7, // 7 days
    // })

    return {
      status: 200,
      success: true,
      message: null,
      data: {
        accessToken: hashedPassword,
        refreshToken: 'rt3232323',
        role: 'admin',
        user: {
          id: 'number',
          pub_id: 'string',
          email: 'string',
          username: 'string',
          first_name: 'string',
          last_name: 'string',
          avatar_url: 'string',
          preferred_theme: 'string',
          email_confirmed_at: 'number',
          last_seen_at: 'number',
          banned_until: 'number',
          created_at: 'number',
          updated_at: 'number',
        },
      },
      error: {
        hint: 100000,
        reason: 'Invalid credentials',
      },
    }
  } catch (error) {
    return throwErrorResponse(error, 400)
  }
})
