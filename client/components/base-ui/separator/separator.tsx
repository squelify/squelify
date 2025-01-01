import * as SeparatorPrimitive from '@radix-ui/react-separator'
import * as React from 'react'
import { clx } from '#/utils/helper'
import { type SeparatorVariants, separatorStyles } from './separator.css'

const Separator = React.forwardRef<
  React.ComponentRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={clx(separatorStyles({ orientation }), className)}
    {...props}
  />
))

Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
