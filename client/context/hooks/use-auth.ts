import { useContext } from 'react'
import { AppContext } from '#/context/providers/auth-provider'

export function useAuth() {
  const context = useContext(AppContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context.auth
}
