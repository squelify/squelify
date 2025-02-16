import { useLoaderData as useLoaderDataOriginal } from 'react-router'

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

export { useLoaderData }
