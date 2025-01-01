import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from '@radix-ui/react-icons'
import * as React from 'react'
import { checkboxStyles } from './checkbox.css'
import type { CheckboxVariants } from './checkbox.css'

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    CheckboxVariants {}

const Checkbox = React.forwardRef<React.ComponentRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, size, ...props }, ref) => {
    const styles = checkboxStyles({ size })
    return (
      <CheckboxPrimitive.Root ref={ref} className={styles.root({ className })} {...props}>
        <CheckboxPrimitive.Indicator className={styles.indicator()}>
          <CheckIcon className={styles.icon()} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    )
  }
)

Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
