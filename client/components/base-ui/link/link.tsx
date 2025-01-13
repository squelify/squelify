import { Slot } from '@radix-ui/react-slot'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { type LinkVariants, linkStyles } from './link.css'

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement>, LinkVariants {
  asChild?: boolean
  newTab?: boolean
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Component(
  { href, asChild, className, newTab, variant, size, children, ...rest },
  ref
) {
  const Comp = asChild ? Slot : 'a'
  const styles = linkStyles({ variant, size, newTab })

  return (
    <Comp
      href={href}
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
    </Comp>
  )
})

Link.displayName = 'Link'

export { Link }
