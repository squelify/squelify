import { useStore } from '@nanostores/react'
import consola from 'consola'
import { NuqsAdapter } from 'nuqs/adapters/react'
import { createContext, useCallback, useEffect, useMemo, useRef } from 'react'
import { ILoginResponse } from '~/api/auth/login.post'
import pkg from '~~/package.json' with { type: 'json' }
import { useApiClient } from '#/context/hooks/use-api-client'
import { authStore, resetAuthState, saveAuthState } from '#/context/stores/auth.store'
import { defaultAuthStoreValues } from '#/context/stores/auth.store'
import type { AuthStore } from '#/context/stores/auth.store'
import type { ApiResponse } from '#/services/types'

type AppProviderProps = {
  children: React.ReactNode
  defaultSuffix?: string
  defaultSeparator?: string
}

export type AppProviderState = {
  defaultSuffix: string
  defaultSeparator?: string
  auth: Pick<AuthStore, 'user'> & {
    login: (identity: string, password: string) => Promise<ApiResponse<ILoginResponse> | null>
    logout: () => Promise<void>
  }
}

const initialState: AppProviderState = {
  defaultSuffix: pkg.config.appName,
  defaultSeparator: '-',
  auth: {
    user: defaultAuthStoreValues.user,
    login: async () => null,
    logout: async () => {},
  },
}

export const AppContext = createContext<AppProviderState>(initialState)

export default function AppProvider({
  children,
  defaultSuffix = initialState.defaultSuffix,
  defaultSeparator = initialState.defaultSeparator,
  ...props
}: AppProviderProps) {
  const { current: apiClient } = useRef(useApiClient())
  const authState = useStore(authStore)

  // Prevent concurrent login calls
  const loginLockRef = useRef(false)

  const checkAuthState = useCallback(async () => {
    const now = Math.floor(Date.now() / 1000)
    const hasValidToken =
      authState.accessToken && authState.accessTokenExpiry && authState.accessTokenExpiry > now

    if (!hasValidToken) {
      resetAuthState()
      return
    }
  }, [authState])

  useEffect(() => {
    let isMounted = true

    const runCheckAuthState = async () => {
      if (!isMounted) return
      await checkAuthState()
    }

    runCheckAuthState()
    const interval = setInterval(runCheckAuthState, 5 * 60 * 1000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [checkAuthState])

  const login = useCallback(async (identity: string, password: string) => {
    if (loginLockRef.current) {
      throw new Error('Login already in progress')
    }

    loginLockRef.current = true

    try {
      const deviceType = 'browser'
      const loginResult = await apiClient.auth.login({ identity, password, deviceType })
      if (!loginResult?.data?.accessToken) {
        throw new Error('Invalid response data')
      }

      const authData = loginResult.data
      const initialAuthState: AuthStore = {
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
        accessTokenExpiry: authData.tokenExpiry,
        refreshTokenExpiry: authData.sessionExpiry,
        user: null,
      }

      saveAuthState(initialAuthState)

      const userResult = await apiClient.auth.getCurrentUser()
      if (userResult?.data?.user) {
        saveAuthState({ ...initialAuthState, user: userResult.data.user })
      }

      return loginResult
    } catch (error) {
      resetAuthState()

      throw error
    } finally {
      loginLockRef.current = false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      resetAuthState()
    } catch (error) {
      consola.error(error)
    }
  }, [])

  const value = useMemo(
    () => ({
      defaultSuffix,
      defaultSeparator,
      auth: { user: authState.user, login, logout },
    }),
    [defaultSuffix, defaultSeparator, authState.user, login, logout]
  )

  return (
    <NuqsAdapter>
      <AppContext.Provider {...props} value={value}>
        {children}
      </AppContext.Provider>
    </NuqsAdapter>
  )
}
