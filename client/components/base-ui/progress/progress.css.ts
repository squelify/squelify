import { type VariantProps, tv } from 'tailwind-variants'

export const progressStyles = tv({
  slots: {
    root: 'relative w-full overflow-hidden rounded-full bg-primary/20',
    indicator: 'h-full w-full flex-1 bg-primary transition-all',
  },
  variants: {
    size: {
      default: {
        root: 'h-2',
      },
      sm: {
        root: 'h-1',
      },
      lg: {
        root: 'h-3',
      },
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export type ProgressVariants = VariantProps<typeof progressStyles>
