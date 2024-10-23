import { z } from 'zod'
import { findUserByEmail } from '~/database/repository/user.repo'

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

    const user = await findUserByEmail(parseBody.data.identity)

    if (!user) {
      return createErrorResponse(400, 'Invalid credentials')
    }

    // await sendJSXEmail<OtpCodeProps>('otp-code', 'user@example.com', {
    //   name: 'John Doe',
    //   email: 'user@example.com',
    //   otp: '123456',
    // })

    const hashedPassword = await hashPassword(parseBody.data.password)
    logger.debug('[app]', hashedPassword)

    const payload = { userId: user.id, email: user.email }
    const accessToken = await generateAccessToken(payload)
    const refreshToken = await generateRefreshToken(payload)
    const sessionId = 'sess_1212121212121212121'

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
      data: { userId: user.id, sessionId, accessToken, refreshToken },
    }
  } catch (error) {
    return throwErrorResponse(error, 400)
  }
})
