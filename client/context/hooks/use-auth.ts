import { useContext } from 'react'
import { AuthContext } from '#/context/providers/app-provider'

export function useAuth() {
  return useContext(AuthContext)
}
