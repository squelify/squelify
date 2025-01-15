import { useContext } from 'react'
import { AppContext } from '#/context/providers/app-provider'

export function useAuth() {
  const context = useContext(AppContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within AppProvider')
  }

  return context.auth
}
