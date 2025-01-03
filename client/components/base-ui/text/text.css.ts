import { type VariantProps, tv } from 'tailwind-variants'

export const textStyles = tv({
  base: ['text-foreground', 'transition-colors duration-200'],
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
    },
    weight: {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
    variant: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      secondary: 'text-secondary-foreground',
      destructive: 'text-destructive',
      success: 'text-success',
      warning: 'text-warning',
    },
  },
  defaultVariants: {
    size: 'md',
    weight: 'normal',
    align: 'left',
    variant: 'default',
  },
})

export type TextVariants = VariantProps<typeof textStyles>
