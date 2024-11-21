import { persistentMap } from '@nanostores/persistent'
import type { UserInfo } from '#/services/types'

type AuthStore = {
  accessToken: string | null
  refreshToken: string | null
  accessTokenExpiry: number | null
  refreshTokenExpiry: number | null
  user: UserInfo | null
}

// Default values for the AuthStore
const defaultAuthStoreValues: AuthStore = {
  accessToken: null,
  refreshToken: null,
  accessTokenExpiry: null,
  refreshTokenExpiry: null,
  user: null,
}

/**
 * A persistent map store for the Auth state, with the default values for the sidebar state.
 * Using key-value map store. It will keep each key in separated localStorage key.
 * You can switch localStorage to any other storage for all used stores.
 * @ref: https://github.com/nanostores/persistent#persistent-engines
 */
const authStore = persistentMap<AuthStore>('auth:', defaultAuthStoreValues, {
  encode: (value) => (typeof value === 'string' ? value : JSON.stringify(value)),
  decode: (value) => (typeof value === 'string' ? value : JSON.parse(value)),
})

/**
 * Saves the current authentication state to the persistent store.
 * @param values - A partial object of the AuthStore type, containing the values to be updated in the store.
 */
function saveAuthState(values: Partial<AuthStore>) {
  authStore.set({ ...authStore.get(), ...values })
}

/**
 * Resets the authentication state to the default values.
 * This function can be used to log out the user and clear the authentication state.
 */
function resetAuthState() {
  authStore.set(defaultAuthStoreValues)
}

export { authStore, defaultAuthStoreValues, saveAuthState, resetAuthState }
export type { AuthStore }
