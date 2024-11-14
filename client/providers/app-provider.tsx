import { useStore } from '@nanostores/react'
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ILoginResponse } from '~/api/auth/login.post'
import PageLoader from '#/components/loader'
import { useApiClient } from '#/context/hooks/use-api-client'
import { authStore, resetAuthState, saveAuthState } from '#/context/stores/auth.store'
import { defaultAuthStoreValues } from '#/context/stores/auth.store'
import type { AuthStore } from '#/context/stores/auth.store'
import { SEOMetaProvider } from '#/providers/seo-provider'
import type { ApiResponse } from '#/services/types'
import { clx } from '#/utils/helper'

export type AuthContextType = {
  isInitialized: boolean
  login: (
    identity: string,
    password: string,
    remember?: boolean
  ) => Promise<ApiResponse<ILoginResponse> | null>
  logout: () => void
} & Pick<AuthStore, 'user'>

export type AppContextType = Pick<AuthContextType, 'user' | 'logout'>

const defaultAuthContext: AuthContextType = {
  user: defaultAuthStoreValues.user,
  isInitialized: false,
  login: async () => null,
  logout: () => {},
}

export const AuthContext = createContext(defaultAuthContext)

interface AppProviderProps {
  children: React.ReactNode
  debugScreenSize?: boolean
}

export default function AppProvider({ children, debugScreenSize }: AppProviderProps) {
  const { current: apiClient } = useRef(useApiClient())
  const authState = useStore(authStore)
  const [isInitialized, setIsInitialized] = useState(false)

  const initializeAuth = useCallback(async () => {
    const hasStoredAuth = !!authState.sessionId

    if (!hasStoredAuth) {
      resetAuthState()
      setIsInitialized(true)
      return
    }

    try {
      const response = await apiClient.auth.getCurrentUser()
      if (response?.data?.user) {
        saveAuthState({
          sessionId: authState.sessionId,
          user: response.data.user,
        })
      }
    } catch {
      resetAuthState()
    }

    setIsInitialized(true)
  }, [authState.sessionId])

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const login = useCallback(
    async (identity: string, password: string): Promise<ApiResponse<ILoginResponse> | null> => {
      try {
        const result = await apiClient.auth.login({ identity, password })
        if (!result?.data?.user) throw new Error('Invalid response data')

        const { user, credentials } = result.data

        saveAuthState({
          user: {
            ...user,
            // TODO: sync with API response
            username: user.email, // Assuming email can be used as username
            avatarUrl: '', // Provide a default value or fetch from API if available
            isActive: 1, // Assuming the user is active by default
            createdAt: Date.now(), // Use current timestamp or fetch from API
            updatedAt: Date.now(), // Use current timestamp or fetch from API
            deletedAt: 0, // Assuming not deleted
          },
          accessToken: credentials.accessToken,
          refreshToken: credentials.refreshToken,
          sessionId: credentials.sessionId,
        })

        return result
      } catch (error) {
        resetAuthState()
        throw error
      }
    },
    []
  )

  const logout = useCallback(async () => {
    try {
      if (authState.sessionId) {
        await apiClient.auth.signout({
          sessionId: authState.sessionId,
        })
      }
    } finally {
      resetAuthState()
    }
  }, [authState.sessionId])

  const authContextValues = useMemo(
    () => ({
      user: authState.user,
      isInitialized,
      login,
      logout,
    }),
    [authState.user, isInitialized, login, logout]
  )

  if (!isInitialized) {
    return <PageLoader />
  }

  return (
    <SEOMetaProvider defaultSuffix="Squelify" defaultSeparator="|">
      <AuthContext.Provider value={authContextValues}>
        <div className={clx(debugScreenSize && 'debug-breakpoints')}>{children}</div>
      </AuthContext.Provider>
    </SEOMetaProvider>
  )
}
