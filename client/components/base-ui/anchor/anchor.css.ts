import { type VariantProps, tv } from 'tailwind-variants'

export const anchorStyles = tv({
  base: 'inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0',
  variants: {
    variant: {
      default: 'text-gray-900 hover:text-gray-800 dark:text-gray-100 dark:hover:text-gray-200',
      primary: 'text-brand-600 hover:text-brand-700 active:text-brand-800',
      secondary: 'text-gray-700 hover:text-gray-800 dark:text-gray-200 dark:hover:text-gray-100',
      subtle: 'text-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-50',
      destructive: 'text-red-600 hover:text-red-700 active:text-red-800',
      success: 'text-green-600 hover:text-green-700 active:text-green-800',
      warning: 'text-yellow-500 hover:text-yellow-600 active:text-yellow-700',
      ghost: 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100',
      link: 'text-brand-600 underline-offset-4 hover:text-brand-700 hover:underline active:text-brand-800',
    },
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      default: 'text-sm',
      lg: 'text-base',
      xl: 'font-semibold text-lg',
    },
    disabled: {
      true: 'pointer-events-none cursor-not-allowed opacity-50',
      false: '',
    },
    grouped: {
      true: 'group-hover:translate-x-1 group-hover:scale-105',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    disabled: false,
    grouped: false,
  },
})

export type AnchorVariants = VariantProps<typeof anchorStyles>
