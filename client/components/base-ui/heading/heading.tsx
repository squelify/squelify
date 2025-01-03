import { type Assign } from '@ark-ui/react'
import { type HTMLArkProps, ark } from '@ark-ui/react/factory'
import * as React from 'react'
import { type HeadingVariants, headingStyles } from './heading.css'

export interface HeadingProps extends Assign<HTMLArkProps<'h2'>, HeadingVariants> {
  asChild?: boolean
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 'h2', weight, align, asChild = false, ...props }, ref) => {
    return (
      <ark.h2
        ref={ref}
        className={headingStyles({ level, weight, align, className })}
        asChild={asChild}
        {...props}
      />
    )
  }
)

Heading.displayName = 'Heading'

export { Heading }
