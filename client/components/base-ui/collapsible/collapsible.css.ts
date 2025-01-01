import { type VariantProps, tv } from 'tailwind-variants'

export const collapsibleStyles = tv({
  base: 'w-full',
})

export type CollapsibleVariants = VariantProps<typeof collapsibleStyles>
