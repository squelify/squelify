import { type VariantProps, tv } from 'tailwind-variants'

export const radioGroupStyles = tv({
  base: 'grid gap-2',
})

export const radioGroupItemStyles = tv({
  base: [
    'aspect-square size-4 rounded-full border border-primary text-primary shadow',
    'focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
})

export const radioGroupIndicatorStyles = tv({
  base: 'flex items-center justify-center',
})

export type RadioGroupVariants = VariantProps<typeof radioGroupStyles>
