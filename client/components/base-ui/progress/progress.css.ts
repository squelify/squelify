import { type VariantProps, tv } from 'tailwind-variants'

export const progressStyles = tv({
  base: 'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
})

export const progressIndicatorStyles = tv({
  base: 'h-full w-full flex-1 bg-primary transition-all',
})

export type ProgressVariants = VariantProps<typeof progressStyles>
