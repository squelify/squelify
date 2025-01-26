/**
 * Handle responsive design that detects if a media query matches.
 * Provides reactive way to respond to viewport/media changes.
 *
 * @param query - CSS media query string
 * @returns boolean indicating if the media query matches
 *
 * @example
 * function ResponsiveComponent() {
 *   const isMobile = useMediaQuery('(max-width: 768px)')
 *   const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
 *
 *   return (
 *     <div>
 *       {isMobile && <MobileNav />}
 *       {isTablet && <TabletNav />}
 *       {!isMobile && !isTablet && <DesktopNav />}
 *     </div>
 *   )
 * }
 */

import * as React from 'react'

function useMediaQuery(query: string): boolean {
  const [value, setValue] = React.useState(false)

  React.useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches)
    }

    const result = matchMedia(query)
    result.addEventListener('change', onChange)
    setValue(result.matches)

    return () => result.removeEventListener('change', onChange)
  }, [query])

  return value
}

export default useMediaQuery
