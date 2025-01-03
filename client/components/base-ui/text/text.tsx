import { type Assign } from '@ark-ui/react'
import { type HTMLArkProps, ark } from '@ark-ui/react/factory'

import * as React from 'react'
import { type TextVariants, textStyles } from './text.css'

export interface TextProps extends Assign<HTMLArkProps<'p'>, TextVariants> {
  asChild?: boolean
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <ark.p
        ref={ref}
        className={textStyles({ variant, size, className })}
        asChild={asChild}
        {...props}
      />
    )
  }
)

Text.displayName = 'Text'

export { Text }
