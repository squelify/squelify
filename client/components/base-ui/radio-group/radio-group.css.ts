import { type VariantProps, tv } from 'tailwind-variants'

export const radioGroupStyles = tv({
  slots: {
    root: 'grid gap-2',
    item: [
      'aspect-square rounded-full border border-primary text-primary shadow',
      'focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ],
    indicator: 'flex items-center justify-center',
    icon: 'size-3.5 fill-primary',
  },
  variants: {
    size: {
      default: {
        item: 'size-4',
        icon: 'size-3.5',
      },
      sm: {
        item: 'size-3',
        icon: 'size-2.5',
      },
      lg: {
        item: 'size-5',
        icon: 'size-4.5',
      },
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export type RadioGroupVariants = VariantProps<typeof radioGroupStyles>
