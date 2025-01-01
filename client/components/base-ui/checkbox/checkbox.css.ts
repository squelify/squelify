import { type VariantProps, tv } from 'tailwind-variants'

export const checkboxStyles = tv({
  base: [
    'peer size-4 shrink-0 rounded border border-primary shadow',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
  ],
})

export const checkboxIndicatorStyles = tv({
  base: 'flex items-center justify-center text-current',
})

export type CheckboxVariants = VariantProps<typeof checkboxStyles>
