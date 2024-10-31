import type React from 'react'
import { createContext, useContext } from 'react'

interface SEOMetaContextType {
  defaultSuffix: string
  defaultSeparator: string
}

/**
 * Creates a React context for managing the default page title suffix and separator.
 * This context is intended to be used by the `SEOMetaProvider` component to provide
 * these values to child components that need to access them.
 */
const SEOMetaContext = createContext<SEOMetaContextType | undefined>(undefined)

/**
 * Provides a React context for managing the default page title suffix and separator.
 * This component should be used to wrap the components that need to access the page title context.
 *
 * @param defaultSuffix - The default suffix to be appended to the page title.
 * @param defaultSeparator - The default separator to be used between the page title and suffix.
 * @param children - The child components that will have access to the page title context.
 */
export const SEOMetaProvider: React.FC<SEOMetaContextType & { children: React.ReactNode }> = ({
  defaultSuffix,
  defaultSeparator,
  children,
}) => {
  return (
    <SEOMetaContext.Provider value={{ defaultSuffix, defaultSeparator }}>
      {children}
    </SEOMetaContext.Provider>
  )
}

/**
 * Provides a hook to access the page title context, which contains the default page title suffix and separator.
 * This hook should be used by components that need to access the page title context.
 *
 * @returns The page title context, which includes the default suffix and separator.
 * @throws Error if the hook is used outside of a SEOMetaProvider component.
 */
export const useSEOMetaContext = () => {
  const context = useContext(SEOMetaContext)
  if (context === undefined) {
    throw new Error(
      'useSEOMeta must be used within a SEOMetaProvider. Ensure SEOMetaProvider is present in the component tree above this component.'
    )
  }
  return context
}
