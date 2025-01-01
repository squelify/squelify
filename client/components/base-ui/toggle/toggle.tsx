import * as TogglePrimitive from '@radix-ui/react-toggle'
import * as React from 'react'
import { clx } from '#/utils/helper'
import { type ToggleVariants, toggleStyles } from './toggle.css'

const Toggle = React.forwardRef<
  React.ComponentRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & ToggleVariants
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={clx(toggleStyles({ variant, size }), className)}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle }
