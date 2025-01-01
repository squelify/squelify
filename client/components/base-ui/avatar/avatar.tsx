import * as AvatarPrimitive from '@radix-ui/react-avatar'
import * as React from 'react'
import { avatarStyles } from './avatar.css'
import type { AvatarVariants } from './avatar.css'

interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    AvatarVariants {}

const Avatar = React.forwardRef<React.ComponentRef<typeof AvatarPrimitive.Root>, AvatarProps>(
  ({ className, size, ...props }, ref) => {
    const styles = avatarStyles({ size })
    return <AvatarPrimitive.Root ref={ref} className={styles.root({ className })} {...props} />
  }
)

const AvatarImage = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => {
  const styles = avatarStyles()
  return <AvatarPrimitive.Image ref={ref} className={styles.image({ className })} {...props} />
})

const AvatarFallback = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => {
  const styles = avatarStyles()
  return (
    <AvatarPrimitive.Fallback ref={ref} className={styles.fallback({ className })} {...props} />
  )
})

Avatar.displayName = AvatarPrimitive.Root.displayName
AvatarImage.displayName = AvatarPrimitive.Image.displayName
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
