import * as SwitchPrimitives from '@radix-ui/react-switch'
import * as React from 'react'
import { clx } from '#/utils/helper'
import { switchRootStyles, switchThumbStyles } from './switch.css'

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root className={clx(switchRootStyles(), className)} {...props} ref={ref}>
    <SwitchPrimitives.Thumb className={switchThumbStyles()} />
  </SwitchPrimitives.Root>
))

Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
