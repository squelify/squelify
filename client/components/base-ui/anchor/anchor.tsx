import { type Assign } from '@ark-ui/react'
import { type HTMLArkProps, ark } from '@ark-ui/react/factory'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { type AnchorVariants, anchorStyles } from './anchor.css'

export interface AnchorProps extends Assign<HTMLArkProps<'a'>, AnchorVariants> {
  asChild?: boolean
  newTab?: boolean
  disabled?: boolean
}

const Anchor = React.forwardRef<HTMLAnchorElement, AnchorProps>(
  ({ className, variant, size, asChild = false, newTab, disabled, children, ...props }, ref) => {
    return (
      <ark.a
        ref={ref}
        className={anchorStyles({ variant, size, disabled, className })}
        rel={newTab ? 'noopener noreferrer' : undefined}
        target={newTab ? '_blank' : undefined}
        asChild={asChild}
        {...props}
      >
        {children}
        {newTab && <Lucide.ExternalLink className="ml-1" strokeWidth={2} />}
      </ark.a>
    )
  }
)

Anchor.displayName = 'Anchor'

export { Anchor }
