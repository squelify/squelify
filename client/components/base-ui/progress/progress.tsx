import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as React from 'react'
import { progressStyles } from './progress.css'
import type { ProgressVariants } from './progress.css'

const Progress = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & ProgressVariants
>(({ className, value, size, ...props }, ref) => {
  const styles = progressStyles({ size })
  return (
    <ProgressPrimitive.Root ref={ref} className={styles.root({ className })} {...props}>
      <ProgressPrimitive.Indicator
        className={styles.indicator()}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})

Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
