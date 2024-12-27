import { persistentMap } from '@nanostores/persistent'
import type { AuthState } from '#/services/types/auth'
import { storeDecode, storeEncode } from '#/utils/helper'

/**
 * The default values for the auth store
 */
const defaultAuthStoreValues: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
}

/**
 * A persistent map store for the auth state.
 * Using key-value map store that keeps each key in separated localStorage key.
 */
const authStore = persistentMap<AuthState>('auth:', defaultAuthStoreValues, {
  encode: storeEncode,
  decode: storeDecode,
})

/**
 * Updates the auth state by merging the provided partial auth store values
 * with the existing values.
 */
function updateAuthState(values: Partial<AuthState>) {
  authStore.set({ ...authStore.get(), ...values })
}

/**
 * Resets the auth store to its default values
 */
function resetAuthState() {
  authStore.set(defaultAuthStoreValues)
}

export { authStore, defaultAuthStoreValues, updateAuthState, resetAuthState }
