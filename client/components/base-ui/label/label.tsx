import * as LabelPrimitive from '@radix-ui/react-label'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'
import { clx } from '#/utils/helper'

const labelStyles = cva(
  'font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
)

const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelStyles>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={clx(labelStyles(), className)} {...props} />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
