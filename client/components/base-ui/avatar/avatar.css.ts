import { type VariantProps, tv } from 'tailwind-variants'

export const avatarStyles = tv({
  base: 'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
})

export const avatarImageStyles = tv({
  base: 'aspect-square h-full w-full',
})

export const avatarFallbackStyles = tv({
  base: 'flex h-full w-full items-center justify-center rounded-full bg-muted',
})

export type AvatarVariants = VariantProps<typeof avatarStyles>
