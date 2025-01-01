import { type VariantProps, tv } from 'tailwind-variants'

export const checkboxStyles = tv({
  slots: {
    root: [
      'peer shrink-0 rounded border border-primary shadow',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
    ],
    indicator: 'flex items-center justify-center text-current',
    icon: 'size-4',
  },
  variants: {
    size: {
      default: {
        root: 'size-4',
        icon: 'size-4',
      },
      sm: {
        root: 'size-3',
        icon: 'size-3',
      },
      lg: {
        root: 'size-5',
        icon: 'size-5',
      },
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export type CheckboxVariants = VariantProps<typeof checkboxStyles>
