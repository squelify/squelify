import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import * as React from 'react'
import { tooltipStyles } from './tooltip.css'
import type { TooltipVariants } from './tooltip.css'

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & TooltipVariants
>(({ className, sideOffset = 4, size, children, ...props }, ref) => {
  const styles = tooltipStyles({ size })
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={styles.content({ className })}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className={styles.arrow()} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
})

TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
