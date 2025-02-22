import { z } from 'zod'

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional().default(false),
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  accessTokenExpiry: z.number(),
  refreshTokenExpiry: z.number(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string().nullable(),
    avatarUrl: z.string().nullable(),
  }),
})

export type LoginResponse = z.infer<typeof LoginResponseSchema>
