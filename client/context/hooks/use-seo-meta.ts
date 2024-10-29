import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSEOMetaContext } from '#/context/providers/seo-provider'

interface SEOMetaOptions {
  separator?: string | null
  suffix?: string | null
  description?: string
  image?: string
  url?: string
  twitterUsername?: string
}

/**
 * A React hook that sets the page title and SEO meta tags with configurable options.
 *
 * @param initialTitle - The initial main title to be displayed.
 * @param options - Configuration options for the title and SEO meta tags.
 * @param options.separator - Custom separator between title and suffix. Spaces are automatically added if defined. If null, no separator is used.
 * @param options.suffix - Custom suffix. If undefined, uses DEFAULT_SUFFIX. If null or empty string, no suffix is added.
 * @param options.description - Meta description for SEO purposes.
 * @param options.image - URL of the image to be used for OpenGraph and Twitter cards.
 * @param options.url - Canonical URL of the page.
 * @param options.twitterUsername - Twitter username for the website (without @).
 *
 * @returns An object containing:
 * - pageTitle: The current title without suffix
 * - fullTitle: The complete title including suffix (if any)
 * - updatePageTitle: A function to update the title
 *
 * @example
 * function HomePage() {
 *   const { pageTitle, fullTitle, updatePageTitle } = useSEOMeta('Home', {
 *     description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
 *     image: 'https://example.com/og-image.jpg',
 *     url: 'https://example.com',
 *     twitterUsername: 'riipandi'
 *   })
 *   return (
 *     <div>
 *       <h1>{pageTitle}</h1>
 *       <p>Full page title: {fullTitle}</p>
 *       <button onClick={() => updatePageTitle('New Home')}>Update Title</button>
 *     </div>
 *   )
 * }
 *
 * Note: This hook must be used within a SEOMetaProvider component.
 */
export function useSEOMeta(initialTitle: string, options?: SEOMetaOptions) {
  const { separator, suffix, description, image, url, twitterUsername } = options || {}
  const { defaultSuffix, defaultSeparator } = useSEOMetaContext()
  const [pageTitle, setPageTitle] = useState(initialTitle)

  const fullTitle = useMemo(() => {
    const finalSeparator = separator === null ? '' : separator ? separator.trim() : defaultSeparator
    const finalSuffix = suffix === undefined ? defaultSuffix : suffix
    return finalSuffix !== null
      ? `${pageTitle}${finalSeparator ? ` ${finalSeparator} ` : ''}${finalSuffix}`
      : pageTitle
  }, [pageTitle, separator, suffix, defaultSeparator, defaultSuffix])

  useEffect(() => {
    document.title = fullTitle

    // Update meta tags
    updateMetaTag('description', description)
    updateMetaTag('og:title', fullTitle)
    updateMetaTag('og:description', description)
    updateMetaTag('og:image', image)
    updateMetaTag('og:url', url)
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', fullTitle)
    updateMetaTag('twitter:description', description)
    updateMetaTag('twitter:image', image)
    if (twitterUsername) {
      updateMetaTag('twitter:site', `@${twitterUsername}`)
    }

    return () => {
      document.title = initialTitle
      // Remove meta tags on unmount
      for (const name of [
        'description',
        'og:title',
        'og:description',
        'og:image',
        'og:url',
        'twitter:card',
        'twitter:title',
        'twitter:description',
        'twitter:image',
        'twitter:site',
      ]) {
        removeMetaTag(name)
      }
    }
  }, [fullTitle, initialTitle, description, image, url, twitterUsername])

  const updatePageTitle = useCallback((newTitle: string) => {
    setPageTitle(newTitle)
  }, [])

  return { pageTitle, fullTitle, updatePageTitle }
}

/**
 * Updates the content of an HTML meta tag with the specified name.
 * If the meta tag does not exist, it will be created and added to the document head.
 *
 * @param name - The name attribute of the meta tag to update.
 * @param content - The new content for the meta tag. If not provided, the meta tag will be removed.
 */
function updateMetaTag(name: string, content?: string) {
  if (content) {
    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = name
      document.head.appendChild(meta)
    }
    meta.content = content
  }
}

/**
 * Removes the HTML meta tag with the specified name from the document head.
 *
 * @param name - The name attribute of the meta tag to remove.
 */
function removeMetaTag(name: string) {
  const meta = document.querySelector(`meta[name="${name}"]`)
  if (meta) {
    document.head.removeChild(meta)
  }
}
