import { type VariantProps, tv } from 'tailwind-variants'

export const avatarStyles = tv({
  slots: {
    root: 'relative flex shrink-0 overflow-hidden rounded-full',
    image: 'aspect-square h-full w-full',
    fallback: 'flex h-full w-full items-center justify-center rounded-full bg-muted',
  },
  variants: {
    size: {
      default: {
        root: 'size-10',
      },
      sm: {
        root: 'size-8',
      },
      lg: {
        root: 'size-12',
      },
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export type AvatarVariants = VariantProps<typeof avatarStyles>
