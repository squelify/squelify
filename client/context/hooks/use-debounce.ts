/**
 * Debounce hook that delays updating a value until after a specified delay.
 * Useful for preventing excessive API calls or expensive operations.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds before value updates
 * @returns The debounced value
 *
 * @example
 * function SearchInput() {
 *   const [search, setSearch] = useState('')
 *   const debouncedSearch = useDebounce(search, 500)
 *
 *   useEffect(() => {
 *     // API call will only happen 500ms after user stops typing
 *     fetchSearchResults(debouncedSearch)
 *   }, [debouncedSearch])
 *
 *   return (
 *     <input
 *       type="text"
 *       value={search}
 *       onChange={(e) => setSearch(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   )
 * }
 */

import * as React from 'react'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
