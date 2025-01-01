import { type VariantProps, tv } from 'tailwind-variants'

export const sliderRootStyles = tv({
  base: 'relative flex w-full touch-none select-none items-center',
})

export const sliderTrackStyles = tv({
  base: 'relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20',
})

export const sliderRangeStyles = tv({
  base: 'absolute h-full bg-primary',
})

export const sliderThumbStyles = tv({
  base: [
    'block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
})

export type SliderVariants = VariantProps<typeof sliderRootStyles>
