import * as AccordionPrimitive from '@radix-ui/react-accordion'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { accordionStyles } from './accordion.css'
import type { AccordionVariants } from './accordion.css'

const Accordion = AccordionPrimitive.Root

interface AccordionItemProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>,
    AccordionVariants {}

const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, size, ...props }, ref) => {
  const styles = accordionStyles({ size })
  return <AccordionPrimitive.Item ref={ref} className={styles.item({ className })} {...props} />
})

const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const styles = accordionStyles()
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger ref={ref} className={styles.trigger({ className })} {...props}>
        {children}
        <Lucide.ChevronDown className={styles.icon()} strokeWidth={2} />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
})

const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const styles = accordionStyles()
  return (
    <AccordionPrimitive.Content ref={ref} className={styles.content()} {...props}>
      <div className={styles.contentInner({ className })}>{children}</div>
    </AccordionPrimitive.Content>
  )
})

Accordion.displayName = 'Accordion'
AccordionItem.displayName = 'AccordionItem'
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
