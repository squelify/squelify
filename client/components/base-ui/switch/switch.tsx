import * as SwitchPrimitives from '@radix-ui/react-switch'
import * as React from 'react'
import { switchStyles } from './switch.css'
import type { SwitchVariants } from './switch.css'

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & SwitchVariants
>(({ className, size, ...props }, ref) => {
  const styles = switchStyles({ size })
  return (
    <SwitchPrimitives.Root className={styles.root({ className })} {...props} ref={ref}>
      <SwitchPrimitives.Thumb className={styles.thumb()} />
    </SwitchPrimitives.Root>
  )
})

Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
