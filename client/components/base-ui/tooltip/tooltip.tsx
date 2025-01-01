import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import * as React from 'react'
import { clx } from '#/utils/helper'
import { tooltipArrowStyles, tooltipContentStyles } from './tooltip.css'

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={clx(tooltipContentStyles(), className)}
      {...props}
    >
      {props.children}
      <TooltipPrimitive.Arrow className={tooltipArrowStyles()} />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
))

TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
