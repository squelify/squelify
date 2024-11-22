import { useStore } from '@nanostores/react'
import consola from 'consola'
import { createContext, useCallback, useEffect, useMemo, useRef } from 'react'
import { CookiesProvider, useCookies } from 'react-cookie'
import type { CookieSetOptions } from 'universal-cookie'
import { ILoginResponse } from '~/api/auth/login.post'
import { useApiClient } from '#/context/hooks/use-api-client'
import { authStore, resetAuthState, saveAuthState } from '#/context/stores/auth.store'
import { defaultAuthStoreValues } from '#/context/stores/auth.store'
import type { AuthStore } from '#/context/stores/auth.store'
import { SEOMetaProvider } from '#/providers/seo-provider'
import type { ApiResponse } from '#/services/types'
import { clx } from '#/utils/helper'

const COOKIE_NAME = 'auth_session'
const COOKIE_OPTIONS: Omit<CookieSetOptions, 'maxAge'> = {
  path: '/',
  sameSite: 'lax',
  secure: window.location.protocol === 'https:',
  domain: window.location.hostname,
}

export type AuthContextType = {
  login: (identity: string, password: string) => Promise<ApiResponse<ILoginResponse> | null>
  logout: () => void
} & Pick<AuthStore, 'user'>

export type AppContextType = Pick<AuthContextType, 'user' | 'logout'>

const defaultAuthContext: AuthContextType = {
  user: defaultAuthStoreValues.user,
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
  const [cookies, setCookie, removeCookie] = useCookies([COOKIE_NAME])
  const authState = useStore(authStore)

  // Prevent concurrent login calls
  const loginLockRef = useRef(false)

  const checkAuthState = useCallback(async () => {
    const sessionId = cookies[COOKIE_NAME]

    consola.log('SESSID', sessionId)

    const now = Math.floor(Date.now() / 1000)
    const hasValidToken =
      authState.accessToken && authState.accessTokenExpiry && authState.accessTokenExpiry > now

    if (!hasValidToken) {
      resetAuthState()
      removeCookie(COOKIE_NAME)
      return
    }
  }, [authState, cookies, removeCookie])

  useEffect(() => {
    let isMounted = true

    const runCheckAuthState = async () => {
      if (!isMounted) return
      await checkAuthState()
    }

    // Check first time
    runCheckAuthState()

    // Cek every 5 minutes
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
        const loginResult = await apiClient.auth.login({ identity, password })
        if (!loginResult?.data?.accessToken) {
          throw new Error('Invalid response data')
        }

        const authData = loginResult.data
        const now = Math.floor(Date.now() / 1000)
        const maxAge = authData.sessionExpiry - now

        // Set cookie before updating state, cookie expiry same as the session expiry
        setCookie(COOKIE_NAME, authData.sessionId, { maxAge, ...COOKIE_OPTIONS })

        const initialAuthState: AuthStore = {
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          accessTokenExpiry: authData.tokenExpiry,
          refreshTokenExpiry: authData.sessionExpiry,
          user: null,
        }

        saveAuthState(initialAuthState)

        // Fetch user data
        const userResult = await apiClient.auth.getCurrentUser()
        if (userResult?.data?.user) {
          saveAuthState({ ...initialAuthState, user: userResult.data.user })
        }

        return loginResult
      } catch (error) {
        resetAuthState()
        removeCookie(COOKIE_NAME)
        throw error
      } finally {
        loginLockRef.current = false
      }
    },
    [setCookie, removeCookie]
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: prevent re-render
  const logout = useCallback(async () => {
    try {
      if (cookies[COOKIE_NAME]) {
        await apiClient.auth.signout({ sessionId: cookies[COOKIE_NAME] })
      }
      removeCookie(COOKIE_NAME)
      resetAuthState()
    } catch (error) {
      consola.error(error)
    }
  }, [apiClient])

  const authContextValues = useMemo(
    () => ({ user: authState.user, login, logout }),
    [authState.user, login, logout]
  )

  return (
    <CookiesProvider defaultSetOptions={COOKIE_OPTIONS}>
      <SEOMetaProvider defaultSuffix="Squelify">
        <AuthContext.Provider value={authContextValues}>
          <div className={clx(debugScreenSize && 'debug-breakpoints')}>{children}</div>
        </AuthContext.Provider>
      </SEOMetaProvider>
    </CookiesProvider>
  )
}
