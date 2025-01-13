import { z } from 'zod'
import type ApiClient from '../api-client'
import type { ApiResponse } from '../types'

import { IListUsersResponse, QueryParamSchema } from '~/api/users/index.get'

export default class JWKService {
  constructor(private apiClient: ApiClient) {}

  getAll(opts?: z.infer<typeof QueryParamSchema>) {
    const url = `/users?${new URLSearchParams(opts as Record<string, string>)}`
    return this.apiClient._request<ApiResponse<IListUsersResponse>>(url, {
      method: 'GET',
    })
  }
}
