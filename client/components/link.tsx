import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Link as RouterLink } from 'react-router'
import type { LinkProps as RouterLinkProps } from 'react-router'
import { type LinkVariants, linkStyles } from './base-ui/link/link.css'

export interface LinkProps extends Omit<RouterLinkProps, 'to'>, LinkVariants {
  href: string
  newTab?: boolean
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Component(
  { href, className, newTab, variant, size, children, ...rest },
  ref
) {
  const styles = linkStyles({ variant, size, newTab })

  return (
    <RouterLink
      to={href}
      className={styles.base({ className })}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
      aria-label={newTab ? `${children} (opens in new tab)` : undefined}
      ref={ref}
      {...rest}
    >
      {children}
      {newTab && (
        <>
          <Lucide.ExternalLink className={styles.icon()} aria-hidden="true" />
          <span className="sr-only">(opens in new tab)</span>
        </>
      )}
    </RouterLink>
  )
})

Link.displayName = 'Link'

export { Link }
