import { useStore } from '@nanostores/react'
import consola from 'consola'
import { createContext, useCallback, useEffect, useMemo, useRef } from 'react'
import type { LoginResponse } from '~/trpc/schema/auth.schema'
import { authStore, resetAuthState, saveAuthState } from '#/context/stores/auth.store'
import { defaultAuthStoreValues } from '#/context/stores/auth.store'
import type { AuthStore } from '#/context/stores/auth.store'
import { trpc } from '#/services/trpc-client'

export type AuthProviderState = {
  auth: Pick<AuthStore, 'user'> & {
    login: (identity: string, password: string, remember: boolean) => Promise<LoginResponse | null>
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
      consola.withTag('auth').warn('No valid token found, resetting auth state')
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

  const loginMutation = trpc.auth.login.useMutation()

  const login = useCallback(
    async (email: string, password: string, remember: boolean) => {
      if (loginLockRef.current) {
        throw new Error('Login already in progress')
      }

      loginLockRef.current = true

      try {
        const authData = await loginMutation.mutateAsync({ email, password, remember })

        const initialAuthState: AuthStore = {
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          accessTokenExpiry: authData.accessTokenExpiry,
          refreshTokenExpiry: authData.refreshTokenExpiry,
          user: authData.user,
        }

        console.info('DEBUG:loginResult', initialAuthState)
        saveAuthState(initialAuthState)

        return authData
      } catch (error) {
        resetAuthState()
        throw error
      } finally {
        loginLockRef.current = false
      }
    },
    [loginMutation],
  )

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
    [authState.user, login, logout],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
