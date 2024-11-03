import { z } from 'zod'
import type ApiClient from '../client'
import type { ApiResponse } from '../types'

import { ILoginResponse, LoginRequestSchema } from '~/api/auth/login.post'
import { SignoutRequestSchema } from '~/api/auth/signout.post'
import { SignupRequestSchema } from '~/api/auth/signup.post'

export default class AuthService {
  constructor(private apiClient: ApiClient) {}

  login(opts: z.infer<typeof LoginRequestSchema>) {
    return this.apiClient._request<ApiResponse<ILoginResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(opts),
    })
  }

  signup(opts: z.infer<typeof SignupRequestSchema>) {
    return this.apiClient._request<ApiResponse<any>>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(opts),
    })
  }

  signout(opts: z.infer<typeof SignoutRequestSchema>) {
    return this.apiClient._request<ApiResponse<any>>('/auth/signout', {
      method: 'POST',
      body: JSON.stringify(opts),
    })
  }
}
