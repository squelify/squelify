import { useStore } from '@nanostores/react'
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CookiesProvider, useCookies } from 'react-cookie'
import type { CookieSetOptions } from 'universal-cookie'
import { useApiClient } from '#/context/hooks/use-api-client'
import { SEOMetaProvider } from '#/context/providers/seo-provider'
import { authStore, resetAuthState, saveAuthState } from '#/context/stores/auth.store'
import { defaultAuthStoreValues } from '#/context/stores/auth.store'
import type { AuthStore } from '#/context/stores/auth.store'
import type { User } from '#/services/types/account'
import { clx } from '#/utils/helper'

export type AuthContextType = {
  login: (identity: string, password: string) => Promise<User | null>
  signup: (identity: string, password: string) => Promise<User | null>
  logout: () => void
} & Pick<AuthStore, 'user' | 'role'>

const defaultAuthContext: AuthContextType = {
  user: defaultAuthStoreValues.user,
  role: defaultAuthStoreValues.role,
  login: async () => null,
  signup: async () => null,
  logout: () => {},
}

export const AuthContext = createContext(defaultAuthContext)

interface AppProviderProps {
  children: React.ReactNode
  debugScreenSize?: boolean
}

const COOKIE_NAME = 'auth_session'
const COOKIE_LIFETIME = 60 * 60 * 24 * 7 // 7 days
const COOKIE_OPTIONS: Omit<CookieSetOptions, 'maxAge'> = { path: '/', sameSite: 'strict' }

/**
 * Provides the AppProvider component that manages the authentication state and context for the application.
 *
 * The AppProvider component is responsible for:
 * - Checking the authentication state from cookies and the auth store
 * - Providing a login function to authenticate the user
 * - Providing a logout function to log the user out
 * - Providing the authenticated user data and admin status in the AuthContext
 *
 * The AppProvider component should be used to wrap the entire application to make the AuthContext available.
 */
export default function AppProvider({ children, debugScreenSize }: AppProviderProps) {
  const [cookies, setCookie, removeCookie] = useCookies([COOKIE_NAME])
  const apiRef = useRef(useApiClient())
  const authState = useStore(authStore)

  // Prevents saveAuthState values from being overridden during token validation from cookies.
  const [pendingCheck, setPendingCheck] = useState<boolean>(false)

  const checkAuth = useCallback(() => {
    if (pendingCheck) return

    const isLoggedIn = !!authState.accessToken

    if (!isLoggedIn) {
      logout()
    }

    saveAuthState({
      user: isLoggedIn ? authState.user : null,
      role: isLoggedIn ? authState.role : null,
      accessToken: isLoggedIn ? cookies.auth_session : null,
      refreshToken: isLoggedIn ? cookies.auth_session : null,
    })
  }, [pendingCheck, cookies.auth_session, authState.accessToken, authState.user, authState.role])

  // Check the authentication state from cookies and the auth store
  useEffect(() => checkAuth(), [checkAuth])

  const login = useCallback(
    async (identity: string, password: string) => {
      setPendingCheck(true)

      try {
        const result = await apiRef.current.auth.login(identity, password)

        if (result && result.status !== 200) {
          throw new Error(result.error?.reason || 'An error occurred')
        }

        if (!result.data || !result.data.user) {
          throw new Error('User data is missing from the response')
        }

        // Save the authentication state in the localstorage.
        // This is used by the frontend to check the authentication status.
        saveAuthState({ ...result.data })

        // Set the cookie with a maxAge of 7 days.
        // This is used by the backend to validate the authentication status.
        setCookie(COOKIE_NAME, result.data.accessToken, {
          maxAge: COOKIE_LIFETIME,
          ...COOKIE_OPTIONS,
        })

        return result.data.user
      } finally {
        setPendingCheck(false)
      }
    },
    [setCookie]
  )

  const signup = useCallback(async (identity: string, password: string) => {
    setPendingCheck(true)

    try {
      const result = await apiRef.current.auth.signup(identity, password)

      if (result.status !== 200 || !result.data?.password) {
        throw new Error(result.message || 'Signup failed')
      }

      const user: User = {
        id: 1,
        pub_id: 'user_1',
        email: 'admin@example.com',
        username: 'admin',
        first_name: 'Admin',
        last_name: 'Sistem',
        preferred_theme: 'system',
        last_seen_at: 1723130670,
        created_at: 1723130670,
      }

      return user
    } finally {
      setPendingCheck(false)
    }
  }, [])

  const logout = useCallback(() => {
    removeCookie(COOKIE_NAME)
    resetAuthState()
  }, [removeCookie])

  const authContextValues = useMemo(
    () => ({ ...authState, login, logout, signup }),
    [authState, login, logout, signup]
  )

  return (
    <CookiesProvider defaultSetOptions={COOKIE_OPTIONS}>
      <SEOMetaProvider defaultSuffix="NTRL Stack" defaultSeparator="|">
        <AuthContext.Provider value={authContextValues}>
          <div className={clx(debugScreenSize && 'debug-breakpoints')}>{children}</div>
        </AuthContext.Provider>
      </SEOMetaProvider>
    </CookiesProvider>
  )
}
