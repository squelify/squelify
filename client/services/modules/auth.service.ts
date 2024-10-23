import type ApiClient from '../client'
import type { LoginData, SignupData } from '../types/account'
import type { ApiResponse } from '../types/base'

export default class AuthService {
  constructor(private apiClient: ApiClient) {}

  login(identity: string, password: string) {
    return this.apiClient._request<ApiResponse<LoginData>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identity, password }),
    })
  }

  signup(username: string, password: string) {
    return this.apiClient._request<ApiResponse<SignupData>>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  }

  signout(sessionId: string) {
    const url = `/auth/signout?session_id=${sessionId}`
    return this.apiClient._request<ApiResponse<LoginData>>(url, {
      method: 'POST',
    })
  }
}
