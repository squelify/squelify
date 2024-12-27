import { useStore } from '@nanostores/react'
import { type PropsWithChildren, createContext, useCallback, useEffect } from 'react'
import { authStore, resetAuthState, updateAuthState } from '#/context/stores/auth.store'
import type { AuthState, LoginCredentials, User } from '#/services/types/auth'

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const auth = useStore(authStore)

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })
      const user = await response.json()
      updateAuthState({ isAuthenticated: true, isLoading: false, user })
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout')
      resetAuthState()
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }, [])

  useEffect(() => {
    // Check auth status on mount
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((user: User) => {
        authStore.set({ isAuthenticated: true, isLoading: false, user })
      })
      .catch(() => {
        authStore.set({ isAuthenticated: false, isLoading: false, user: null })
      })
  }, [])

  return <AuthContext.Provider value={{ ...auth, login, logout }}>{children}</AuthContext.Provider>
}
