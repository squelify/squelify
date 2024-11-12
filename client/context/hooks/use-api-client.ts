import { useMemo } from 'react'
import { useLoaderData as useLoaderDataOriginal } from 'react-router-dom'
import { process } from 'std-env'
import { ApiClient } from '#/services'

/**
 * Creates a singleton instance of the `ApiClient` class with the specified configuration.
 *
 * The `ApiClient` instance is responsible for making HTTP requests to the API server.
 * This function ensures that only one instance of the `ApiClient` is created and shared
 * throughout the application.
 *
 * @returns The singleton instance of the `ApiClient` class.
 */
const apiClient = ApiClient.getInstance({
  baseURL: process.env.SQUELIFY_BASE_URL
    ? `${process.env.SQUELIFY_BASE_URL}/api`
    : 'http://localhost:3278/api',
})

/**
 * Returns a memoized instance of the `ApiClient` class.
 *
 * This hook ensures that the same instance of the `ApiClient` is used throughout the application,
 * which can help with performance and consistency.
 *
 * @returns The singleton instance of the `ApiClient` class.
 */
const useApiClient = () => useMemo(() => apiClient, [])

/**
 * Returns the loader data from the React Router DOM `useLoaderData` hook, casting it to the specified type `T`.
 *
 * This function ensures that the loader data is properly typed, which can help with type safety and code
 * maintainability.
 *
 * @template T The type of the loader data.
 * @returns The loader data, cast to the specified type `T`.
 */
const useLoaderData = <T>() => useLoaderDataOriginal() as T

export { apiClient, useApiClient, useLoaderData }
