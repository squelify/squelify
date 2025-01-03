import { Slot } from '@radix-ui/react-slot'
import * as React from 'react'
import { type TextVariants, textStyles } from './text.css'

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement>, TextVariants {
  asChild?: boolean
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'p'
    return <Comp className={textStyles({ variant, size, className })} ref={ref} {...props} />
  }
)

Text.displayName = 'Text'

export { Text }
