export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
}
