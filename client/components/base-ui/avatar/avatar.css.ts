import { type VariantProps, tv } from 'tailwind-variants'

export const avatarStyles = tv({
  slots: {
    root: [
      'relative flex shrink-0 overflow-hidden rounded-full',
      'bg-muted',
      'transition-colors duration-200',
    ],
    image: 'aspect-square h-full w-full object-cover',
    fallback: 'flex h-full w-full items-center justify-center font-medium text-muted-foreground',
  },
  variants: {
    size: {
      xs: { root: 'size-6 text-xs' },
      sm: { root: 'size-8 text-sm' },
      md: { root: 'size-10 text-base' },
      lg: { root: 'size-12 text-lg' },
      xl: { root: 'size-14 text-xl' },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export type AvatarVariants = VariantProps<typeof avatarStyles>
