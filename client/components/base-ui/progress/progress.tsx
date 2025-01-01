import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as React from 'react'
import { clx } from '#/utils/helper'
import { progressIndicatorStyles, progressStyles } from './progress.css'

const Progress = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root ref={ref} className={clx(progressStyles(), className)} {...props}>
    <ProgressPrimitive.Indicator
      className={progressIndicatorStyles()}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))

Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
