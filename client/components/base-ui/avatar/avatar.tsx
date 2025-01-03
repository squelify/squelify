import { Avatar as ArkAvatar } from '@ark-ui/react/avatar'
import * as React from 'react'
import { type AvatarVariants, avatarStyles } from './avatar.css'

export interface AvatarProps extends React.ComponentProps<typeof ArkAvatar.Root>, AvatarVariants {}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, ...props }, ref) => {
    const styles = avatarStyles({ size })
    return <ArkAvatar.Root ref={ref} className={styles.root({ className })} {...props} />
  }
)

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ComponentProps<typeof ArkAvatar.Image>
>(({ className, ...props }, ref) => {
  const styles = avatarStyles()
  return <ArkAvatar.Image ref={ref} className={styles.image({ className })} {...props} />
})

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ArkAvatar.Fallback>
>(({ className, ...props }, ref) => {
  const styles = avatarStyles()
  return <ArkAvatar.Fallback ref={ref} className={styles.fallback({ className })} {...props} />
})

Avatar.displayName = 'Avatar'
AvatarImage.displayName = 'AvatarImage'
AvatarFallback.displayName = 'AvatarFallback'

export { Avatar, AvatarImage, AvatarFallback }
