import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import * as Lucide from 'lucide-react'
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
          <Lucide.Check className={styles.icon()} strokeWidth={2} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    )
  }
)

Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
