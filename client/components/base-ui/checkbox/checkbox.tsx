import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from '@radix-ui/react-icons'
import * as React from 'react'
import { clx } from '#/utils/helper'
import { type CheckboxVariants, checkboxIndicatorStyles, checkboxStyles } from './checkbox.css'

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & CheckboxVariants
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root ref={ref} className={clx(checkboxStyles(), className)} {...props}>
    <CheckboxPrimitive.Indicator className={checkboxIndicatorStyles()}>
      <CheckIcon className="size-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))

Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
