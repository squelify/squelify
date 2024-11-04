import { useStore } from '@nanostores/react'
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CookiesProvider, useCookies } from 'react-cookie'
import type { CookieSetOptions } from 'universal-cookie'
import { ILoginResponse } from '~/api/auth/login.post'
import { useApiClient } from '#/context/hooks/use-api-client'
import { SEOMetaProvider } from '#/context/providers/seo-provider'
import { authStore, resetAuthState, saveAuthState } from '#/context/stores/auth.store'
import { defaultAuthStoreValues } from '#/context/stores/auth.store'
import type { AuthStore } from '#/context/stores/auth.store'
import type { ApiResponse } from '#/services/types'
import { clx } from '#/utils/helper'

export type AuthContextType = {
  login: (identity: string, password: string) => Promise<ApiResponse<ILoginResponse> | null>
  signup: (identity: string, password: string) => Promise<ApiResponse<ILoginResponse> | null>
  logout: () => void
} & Pick<AuthStore, 'user' | 'roles'>

// Used for useOutletContext<AppContextType>()
export type AppContextType = Pick<AuthContextType, 'user' | 'roles' | 'logout'>

const defaultAuthContext: AuthContextType = {
  user: defaultAuthStoreValues.user,
  roles: defaultAuthStoreValues.roles,
  login: async () => null,
  signup: async () => null,
  logout: () => {},
}

export const AuthContext = createContext(defaultAuthContext)

interface AppProviderProps {
  children: React.ReactNode
  debugScreenSize?: boolean
}

// TODO - replace with `cookie-es`
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

  const [pendingCheck, setPendingCheck] = useState<boolean>(false)

  const checkAuth = useCallback(() => {
    if (pendingCheck) return

    const isLoggedIn = !!authState.accessToken

    if (!isLoggedIn) {
      logout()
    }

    saveAuthState({
      user: isLoggedIn ? authState.user : null,
      roles: isLoggedIn ? authState.roles : null,
      accessToken: isLoggedIn ? cookies.auth_session : null,
      refreshToken: isLoggedIn ? cookies.auth_session : null,
    })
  }, [pendingCheck, cookies.auth_session, authState.accessToken, authState.user, authState.roles])

  useEffect(() => checkAuth(), [checkAuth])

  const login = useCallback(
    async (identity: string, password: string): Promise<ApiResponse<ILoginResponse> | null> => {
      setPendingCheck(true)

      try {
        const result = await apiRef.current.auth.login({ identity, password })

        if (result && result.status !== 200) {
          throw new Error(result.message || 'An error occurred')
        }

        if (!result.data || !result.data.user) {
          throw new Error('User data is missing from the response')
        }

        saveAuthState({
          user: {
            id: result.data.user.id,
            firstName: result.data.user.firstName,
            lastName: result.data.user.lastName,
            username: result.data.user.email,
            avatarUrl: '',
            isActive: 1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            deletedAt: 0,
          },
          roles: result.data.user.roles,
          accessToken: result.data.credentials.accessToken,
          refreshToken: result.data.credentials.refreshToken,
        })

        setCookie(COOKIE_NAME, result.data.credentials.accessToken, {
          maxAge: COOKIE_LIFETIME,
          ...COOKIE_OPTIONS,
        })

        return result
      } catch (error) {
        console.error('Login error:', error)
        return null
      } finally {
        setPendingCheck(false)
      }
    },
    [setCookie]
  )

  const signup = useCallback(
    async (identity: string, password: string): Promise<ApiResponse<ILoginResponse> | null> => {
      setPendingCheck(true)

      try {
        const result = await apiRef.current.auth.signup({
          email: identity,
          password,
          firstName: 'Admin',
          lastName: 'Sistem',
          username: 'admin',
        })

        if (result.status !== 200 || !result.data?.password) {
          throw new Error(result.message || 'Signup failed')
        }

        return result
      } catch (error) {
        console.error('Signup error:', error)
        return null
      } finally {
        setPendingCheck(false)
      }
    },
    []
  )

  const logout = useCallback(async () => {
    await apiRef.current.auth.signout({
      sessionId: cookies.auth_session,
    })
    removeCookie(COOKIE_NAME)
    resetAuthState()
  }, [removeCookie, cookies.auth_session])

  const authContextValues: AuthContextType = useMemo(
    () => ({
      user: authState.user,
      roles: authState.roles,
      login,
      logout,
      signup,
    }),
    [authState.user, authState.roles, login, logout, signup]
  )

  return (
    <CookiesProvider defaultSetOptions={COOKIE_OPTIONS}>
      <SEOMetaProvider defaultSuffix="Fastrue" defaultSeparator="|">
        <AuthContext.Provider value={authContextValues}>
          <div className={clx(debugScreenSize && 'debug-breakpoints')}>{children}</div>
        </AuthContext.Provider>
      </SEOMetaProvider>
    </CookiesProvider>
  )
}
