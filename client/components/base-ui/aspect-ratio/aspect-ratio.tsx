import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio'
import * as React from 'react'
import { clx } from '#/utils/helper'
import { type AspectRatioVariants, aspectRatioStyles } from './aspect-ratio.css'

const AspectRatio = React.forwardRef<
  React.ComponentRef<typeof AspectRatioPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root> & AspectRatioVariants
>(({ className, ...props }, ref) => (
  <AspectRatioPrimitive.Root ref={ref} className={clx(aspectRatioStyles(), className)} {...props} />
))

AspectRatio.displayName = AspectRatioPrimitive.Root.displayName

export { AspectRatio }
