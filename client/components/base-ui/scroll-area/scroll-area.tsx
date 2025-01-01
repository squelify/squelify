import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import * as React from 'react'
import { clx } from '#/utils/helper'
import {
  scrollAreaStyles,
  scrollAreaViewportStyles,
  scrollBarStyles,
  scrollBarThumbStyles,
} from './scroll-area.css'

const ScrollArea = React.forwardRef<
  React.ComponentRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root ref={ref} className={clx(scrollAreaStyles(), className)} {...props}>
    <ScrollAreaPrimitive.Viewport className={scrollAreaViewportStyles()}>
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))

const ScrollBar = React.forwardRef<
  React.ComponentRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={clx(scrollBarStyles({ orientation }), className)}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className={scrollBarThumbStyles()} />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))

ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
