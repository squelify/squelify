import { persistentMap } from '@nanostores/persistent'
import { ILoginResponse } from '~/api/auth/login.post'

type AuthStore = {
  sessionId: string | null
  accessToken: string | null
  refreshToken: string | null
  user: ILoginResponse['user'] | null
}

// Default values for the AuthStore
const defaultAuthStoreValues: AuthStore = {
  sessionId: null,
  accessToken: null,
  refreshToken: null,
  user: null,
}

/**
 * Configures a persistent key-value map store for the application's UI state.
 * The store is persisted to the browser's localStorage, using the 'auth:' prefix
 * for the keys. The store values are encoded and decoded using JSON.stringify
 * and JSON.parse, respectively.
 *
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
