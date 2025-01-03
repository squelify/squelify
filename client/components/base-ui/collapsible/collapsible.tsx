import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import * as React from 'react'
import { type CollapsibleVariants, collapsibleStyles } from './collapsible.css'

const Collapsible = React.forwardRef<
  React.ComponentRef<typeof CollapsiblePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root> & CollapsibleVariants
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Root ref={ref} className={collapsibleStyles({ className })} {...props} />
))

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

Collapsible.displayName = CollapsiblePrimitive.Root.displayName

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
