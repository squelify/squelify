import { z } from 'zod'
import type ApiClient from '../client'
import type { ApiResponse } from '../types'

import { ILoginResponse, LoginRequestSchema } from '~/api/auth/login.post'
import { SignoutRequestSchema } from '~/api/auth/signout.post'
import { SignupRequestSchema } from '~/api/auth/signup.post'
import { IUserInfoResponse } from '~/api/auth/whoami.post'

export default class AuthService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Authenticate user and create new session
   */
  login(opts: z.infer<typeof LoginRequestSchema>) {
    return this.apiClient._request<ApiResponse<ILoginResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(opts),
    })
  }

  /**
   * Register new user account
   */
  signup(opts: z.infer<typeof SignupRequestSchema>) {
    return this.apiClient._request<ApiResponse<ILoginResponse>>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(opts),
    })
  }

  /**
   * End current user session
   */
  signout(opts: z.infer<typeof SignoutRequestSchema>) {
    return this.apiClient._request<ApiResponse>('/auth/signout', {
      method: 'POST',
      body: JSON.stringify(opts),
    })
  }

  /**
   * Get current authenticated user data
   */
  getCurrentUser() {
    return this.apiClient._request<ApiResponse<IUserInfoResponse>>('/auth/whoami', {
      method: 'POST',
    })
  }

  /**
   * Request password reset link
   */
  forgotPassword(email: string) {
    return this.apiClient._request<ApiResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  /**
   * Reset user password using token
   */
  resetPassword(token: string, password: string) {
    return this.apiClient._request<ApiResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    })
  }

  /**
   * Refresh access token using refresh token
   */
  refreshToken(refreshToken: string) {
    return this.apiClient._request<ApiResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  }

  /**
   * Update user password
   */
  updatePassword(currentPassword: string, newPassword: string) {
    return this.apiClient._request<ApiResponse>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  /**
   * Send email verification link
   */
  sendVerificationEmail() {
    return this.apiClient._request<ApiResponse>('/auth/verify-email/send', {
      method: 'POST',
    })
  }

  /**
   * Verify email using token
   */
  verifyEmail(token: string) {
    return this.apiClient._request<ApiResponse>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  }
}
