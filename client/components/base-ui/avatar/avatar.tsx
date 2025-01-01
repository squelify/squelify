import * as AvatarPrimitive from '@radix-ui/react-avatar'
import * as React from 'react'
import { clx } from '#/utils/helper'
import {
  type AvatarVariants,
  avatarFallbackStyles,
  avatarImageStyles,
  avatarStyles,
} from './avatar.css'

const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & AvatarVariants
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root ref={ref} className={clx(avatarStyles(), className)} {...props} />
))

const AvatarImage = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={clx(avatarImageStyles(), className)} {...props} />
))

const AvatarFallback = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={clx(avatarFallbackStyles(), className)}
    {...props}
  />
))

Avatar.displayName = AvatarPrimitive.Root.displayName
AvatarImage.displayName = AvatarPrimitive.Image.displayName
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
