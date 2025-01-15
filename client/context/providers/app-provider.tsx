import { useStore } from '@nanostores/react'
import consola from 'consola'
import { NuqsAdapter } from 'nuqs/adapters/react'
import { createContext, useCallback, useEffect, useMemo, useRef } from 'react'
import { CookiesProvider, useCookies } from 'react-cookie'
import { ILoginResponse } from '~/api/auth/login.post'
import { useApiClient } from '#/context/hooks/use-api-client'
import { useThemeHandler } from '#/context/hooks/use-theme'
import { authStore, resetAuthState, saveAuthState } from '#/context/stores/auth.store'
import { defaultAuthStoreValues } from '#/context/stores/auth.store'
import type { AuthStore } from '#/context/stores/auth.store'
import { type Theme, saveUiState, uiStore } from '#/context/stores/ui.store'
import { AUTH_COOKIE_NAME, COOKIE_OPTIONS } from '#/services/options'
import type { ApiResponse } from '#/services/types'

type AppProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultSuffix?: string
  defaultSeparator?: string
}

export type AppProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  defaultSuffix: string
  defaultSeparator?: string
  auth: Pick<AuthStore, 'user'> & {
    login: (identity: string, password: string) => Promise<ApiResponse<ILoginResponse> | null>
    logout: () => Promise<void>
  }
}

const initialState: AppProviderState = {
  theme: 'system',
  setTheme: () => null,
  defaultSuffix: 'Squelify',
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
  defaultTheme = initialState.theme,
  defaultSuffix = initialState.defaultSuffix,
  defaultSeparator = initialState.defaultSeparator,
  ...props
}: AppProviderProps) {
  const [cookies, setCookie, removeCookie] = useCookies([AUTH_COOKIE_NAME])
  const { current: apiClient } = useRef(useApiClient())
  const authState = useStore(authStore)
  const uiState = useStore(uiStore)

  // Prevent concurrent login calls
  const loginLockRef = useRef(false)

  useThemeHandler(uiState.theme)

  const checkAuthState = useCallback(async () => {
    const _sessionId = cookies[AUTH_COOKIE_NAME]
    const now = Math.floor(Date.now() / 1000)
    const hasValidToken =
      authState.accessToken && authState.accessTokenExpiry && authState.accessTokenExpiry > now

    if (!hasValidToken) {
      resetAuthState()
      removeCookie(AUTH_COOKIE_NAME)
      return
    }
  }, [authState, cookies, removeCookie])

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

  const login = useCallback(
    async (identity: string, password: string) => {
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
        const now = Math.floor(Date.now() / 1000)
        const maxAge = authData.sessionExpiry - now

        setCookie(AUTH_COOKIE_NAME, authData.sessionId, { maxAge, ...COOKIE_OPTIONS })

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
        removeCookie(AUTH_COOKIE_NAME)
        throw error
      } finally {
        loginLockRef.current = false
      }
    },
    [setCookie, removeCookie]
  )

  const logout = useCallback(async () => {
    try {
      if (cookies[AUTH_COOKIE_NAME]) {
        await apiClient.auth.signout({
          sessionId: cookies[AUTH_COOKIE_NAME],
          allDevices: false,
        })
      }
      removeCookie(AUTH_COOKIE_NAME)
      resetAuthState()
    } catch (error) {
      consola.error(error)
    }
  }, [cookies, removeCookie])

  const value = useMemo(
    () => ({
      theme: uiState.theme,
      setTheme: (theme: Theme) => saveUiState({ theme }),
      defaultSuffix,
      defaultSeparator,
      auth: { user: authState.user, login, logout },
    }),
    [uiState.theme, defaultSuffix, defaultSeparator, authState.user, login, logout]
  )

  return (
    <CookiesProvider defaultSetOptions={COOKIE_OPTIONS}>
      <NuqsAdapter>
        <AppContext.Provider {...props} value={value}>
          {children}
        </AppContext.Provider>
      </NuqsAdapter>
    </CookiesProvider>
  )
}
