import * as React from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'
import { clx } from '#/utils/helper'
import {
  drawerContentStyles,
  drawerDescriptionStyles,
  drawerFooterStyles,
  drawerHandleStyles,
  drawerHeaderStyles,
  drawerOverlayStyles,
  drawerTitleStyles,
} from './drawer.css'

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
)

const DrawerTrigger = DrawerPrimitive.Trigger
const DrawerPortal = DrawerPrimitive.Portal
const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay ref={ref} className={clx(drawerOverlayStyles(), className)} {...props} />
))

const DrawerContent = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content ref={ref} className={clx(drawerContentStyles(), className)} {...props}>
      <div className={drawerHandleStyles()} />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
))

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clx(drawerHeaderStyles(), className)} {...props} />
)

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clx(drawerFooterStyles(), className)} {...props} />
)

const DrawerTitle = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title ref={ref} className={clx(drawerTitleStyles(), className)} {...props} />
))

const DrawerDescription = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={clx(drawerDescriptionStyles(), className)}
    {...props}
  />
))

Drawer.displayName = 'Drawer'
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName
DrawerContent.displayName = 'DrawerContent'
DrawerHeader.displayName = 'DrawerHeader'
DrawerFooter.displayName = 'DrawerFooter'
DrawerTitle.displayName = DrawerPrimitive.Title.displayName
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
