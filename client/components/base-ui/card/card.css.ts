import { type VariantProps, tv } from 'tailwind-variants'

export const cardStyles = tv({
  slots: {
    root: 'rounded-lg border bg-card text-card-foreground shadow-sm transition-colors duration-200 hover:shadow',
    header: 'flex flex-col space-y-1 p-4',
    title: 'font-semibold text-foreground text-lg leading-none tracking-tight',
    description: 'text-muted-foreground text-sm',
    content: 'p-4 pt-0',
    footer: 'flex items-center justify-end gap-3 p-4 pt-0',
  },
  variants: {
    variant: {
      default: {
        root: 'border-border bg-card',
      },
      secondary: {
        root: 'border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50',
      },
    },
    compact: {
      true: {
        header: 'p-3',
        content: 'p-3 pt-0',
        footer: 'p-3 pt-0',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    compact: false,
  },
})

export type CardVariants = VariantProps<typeof cardStyles>
