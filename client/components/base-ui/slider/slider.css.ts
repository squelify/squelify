import { type VariantProps, tv } from 'tailwind-variants'

export const sliderStyles = tv({
  slots: {
    root: 'relative flex w-full touch-none select-none items-center',
    track: 'relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20',
    range: 'absolute h-full bg-primary',
    thumb: [
      'block rounded-full border border-primary/50 bg-background shadow transition-colors',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      'disabled:pointer-events-none disabled:opacity-50',
    ],
  },
  variants: {
    size: {
      default: {
        thumb: 'h-4 w-4',
      },
      sm: {
        thumb: 'h-3 w-3',
      },
      lg: {
        thumb: 'h-5 w-5',
      },
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export type SliderVariants = VariantProps<typeof sliderStyles>
