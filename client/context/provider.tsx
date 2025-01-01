import { useStore } from '@nanostores/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { NuqsAdapter } from 'nuqs/adapters/react'
import { createContext, useCallback, useEffect, useState } from 'react'
import { useThemeHandler } from '#/context/hooks/use-theme'
import { authStore, resetAuthState, updateAuthState } from '#/context/stores/auth.store'
import { type Theme, saveUiState, uiStore } from '#/context/stores/ui.store'
import { queryClient } from '#/services/query-client'
import { createTrpcClient, trpc } from '#/services/trpc-client'
import type { AuthState, LoginCredentials, User } from '#/services/types/auth'

type AppProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultSuffix?: string
  defaultSeparator?: string
}

type AppProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  defaultSuffix: string
  defaultSeparator?: string
  auth: AuthState & {
    login: (credentials: LoginCredentials) => Promise<void>
    logout: () => Promise<void>
  }
}

const initialState: AppProviderState = {
  theme: 'system',
  setTheme: () => null,
  defaultSuffix: 'Squelify',
  defaultSeparator: '-',
  auth: {
    isAuthenticated: false,
    isLoading: true,
    user: null,
    login: async () => {},
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
  const uiState = useStore(uiStore)
  const auth = useStore(authStore)
  const [trpcClient] = useState(() => createTrpcClient())

  useThemeHandler(uiState.theme)

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
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((user: User) => {
        authStore.set({ isAuthenticated: true, isLoading: false, user })
      })
      .catch(() => {
        authStore.set({ isAuthenticated: false, isLoading: false, user: null })
      })
  }, [])

  const value = {
    theme: uiState.theme,
    setTheme: (theme: Theme) => saveUiState({ theme }),
    defaultSuffix,
    defaultSeparator,
    auth: { ...auth, login, logout },
  }

  return (
    <NuqsAdapter>
      <AppContext.Provider {...props} value={value}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </trpc.Provider>
      </AppContext.Provider>
    </NuqsAdapter>
  )
}
