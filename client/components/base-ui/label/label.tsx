import * as LabelPrimitive from '@radix-ui/react-label'
import * as React from 'react'
import { type LabelVariants, labelStyles } from './label.css'

const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & LabelVariants
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={labelStyles({ className })} {...props} />
))

Label.displayName = LabelPrimitive.Root.displayName

export { Label }
