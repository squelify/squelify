import { useStore } from '@nanostores/react'
import consola from 'consola'
import { createContext, useCallback, useEffect, useMemo, useRef } from 'react'
import { authStore, resetAuthState, saveAuthState } from '#/context/stores/auth.store'
import { defaultAuthStoreValues } from '#/context/stores/auth.store'
import type { AuthStore } from '#/context/stores/auth.store'

export type AuthProviderState = {
  auth: Pick<AuthStore, 'user'> & {
    login: (identity: string, password: string) => Promise<ApiResponse<any> | null>
    logout: () => Promise<void>
  }
}

const initialState: AuthProviderState = {
  auth: {
    user: defaultAuthStoreValues.user,
    login: async () => null,
    logout: async () => {},
  },
}

export const AppContext = createContext<AuthProviderState>(initialState)

export default function AuthProvider({ children }: React.PropsWithChildren) {
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

  const login = useCallback(async (_identity: string, _password: string) => {
    if (loginLockRef.current) {
      throw new Error('Login already in progress')
    }

    loginLockRef.current = true

    try {
      const loginResult: ApiResponse<any> = {
        status: 200,
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: 'string',
            name: 'string',
            email: 'string',
            avatar: 'string',
            role: 'string',
          },
        },
      }

      const initialAuthState: AuthStore = {
        accessToken: 'authData.accessToken',
        refreshToken: 'authData.refreshToken',
        accessTokenExpiry: Number(1234567890),
        refreshTokenExpiry: Number(1234567890),
        user: null,
      }

      saveAuthState(initialAuthState)

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
      auth: { user: authState.user, login, logout },
    }),
    [authState.user, login, logout]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
