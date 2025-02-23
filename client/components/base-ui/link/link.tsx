import { Slot } from '@radix-ui/react-slot'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Link as RouterLink } from 'react-router'
import type { LinkProps as RouterLinkProps } from 'react-router'
import { type LinkVariants, linkStyles } from './link.css'

export interface LinkProps extends Omit<RouterLinkProps, 'to'>, LinkVariants {
  href: string
  asChild?: boolean
  newTab?: boolean
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Component(
  { href, asChild, className, newTab, variant, size, children, ...rest },
  ref,
) {
  const Comp = asChild ? Slot : RouterLink
  const styles = linkStyles({ variant, size, newTab })

  return (
    <Comp
      to={href}
      className={styles.base({ className })}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
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
    </Comp>
  )
})

Link.displayName = 'Link'

export { Link }
