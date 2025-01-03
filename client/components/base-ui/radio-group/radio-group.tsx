import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { radioGroupStyles } from './radio-group.css'
import type { RadioGroupVariants } from './radio-group.css'

const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & RadioGroupVariants
>(({ className, size, ...props }, ref) => {
  const styles = radioGroupStyles({ size })
  return <RadioGroupPrimitive.Root className={styles.root({ className })} {...props} ref={ref} />
})

const RadioGroupItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & RadioGroupVariants
>(({ className, size, ...props }, ref) => {
  const styles = radioGroupStyles({ size })
  return (
    <RadioGroupPrimitive.Item ref={ref} className={styles.item({ className })} {...props}>
      <RadioGroupPrimitive.Indicator className={styles.indicator()}>
        <Lucide.Check className={styles.icon()} strokeWidth={1.8} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})

RadioGroup.displayName = RadioGroupPrimitive.Root.displayName
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
