import { type VariantProps, tv } from 'tailwind-variants'

export const aspectRatioStyles = tv({
  base: 'relative w-full',
})

export type AspectRatioVariants = VariantProps<typeof aspectRatioStyles>
