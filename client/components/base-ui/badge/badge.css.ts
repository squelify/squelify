import { type VariantProps, tv } from 'tailwind-variants'

export const badgeStyles = tv({
  base: [
    'inline-flex items-center rounded-md px-2 py-0.5',
    'font-medium transition-colors duration-200',
    'border border-transparent',
  ],
  variants: {
    variant: {
      default: 'bg-primary/10 text-primary hover:bg-primary/20',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border-current text-foreground',
      destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
      success: 'bg-success/10 text-success hover:bg-success/20',
      warning: 'bg-warning/10 text-warning hover:bg-warning/20',
    },
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

export type BadgeVariants = VariantProps<typeof badgeStyles>
