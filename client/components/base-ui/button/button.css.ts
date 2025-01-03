import { type VariantProps, tv } from 'tailwind-variants'

export const buttonStyles = tv({
  base: 'inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0',
  variants: {
    variant: {
      default:
        'bg-gray-900 text-white shadow-md hover:bg-gray-800 hover:ring-2 hover:ring-gray-500/50 hover:ring-offset-2 active:scale-[0.98] active:bg-gray-950 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200',
      primary:
        'bg-brand-600 text-white shadow-md hover:bg-brand-700 hover:ring-2 hover:ring-brand-500/50 hover:ring-offset-2 active:scale-[0.98] active:bg-brand-800',
      secondary:
        'bg-gray-50 text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100 hover:text-gray-800 active:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-100',
      subtle:
        'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-800/50 dark:text-gray-100 dark:hover:bg-gray-700/50',
      destructive:
        'bg-red-600 text-white shadow-md hover:bg-red-700 hover:ring-2 hover:ring-red-500/50 hover:ring-offset-2 active:scale-[0.98] active:bg-red-800',
      success:
        'bg-green-600 text-white shadow-md hover:bg-green-700 hover:ring-2 hover:ring-green-500/50 hover:ring-offset-2 active:scale-[0.98] active:bg-green-800',
      warning:
        'bg-yellow-500 text-white shadow-md hover:bg-yellow-600 hover:ring-2 hover:ring-yellow-500/50 hover:ring-offset-2 active:scale-[0.98] active:bg-yellow-700',
      outline:
        'border-2 border-gray-300 bg-white/80 text-gray-700 backdrop-blur-sm hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600 active:bg-brand-100',
      ghost:
        'text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800',
      link: 'text-brand-600 underline-offset-4 hover:text-brand-700 hover:underline active:text-brand-800',
      gradient:
        'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg',
    },
    size: {
      xs: 'h-6 rounded px-2 text-xs',
      sm: 'h-7 rounded-md px-2.5 text-sm',
      default: 'h-9 px-4 py-1.5 text-sm',
      lg: 'h-10 rounded-md px-6 text-base',
      xl: 'h-12 rounded-lg px-8 font-semibold text-lg',
      icon: 'aspect-square size-8',
    },
    isLoading: {
      true: 'relative [&>span]:invisible',
      false: '',
    },
    grouped: {
      true: 'group-hover:translate-x-1 group-hover:scale-105',
      false: '',
    },
  },
  compoundVariants: [
    {
      isLoading: true,
      className:
        '[&>svg]:-translate-x-1/2 [&>svg]:-translate-y-1/2 [&>svg]:absolute [&>svg]:top-1/2 [&>svg]:left-1/2 [&>svg]:size-4 [&>svg]:animate-spin',
    },
    {
      variant: ['default', 'primary', 'destructive', 'success', 'warning'],
      isLoading: true,
      className: 'text-white/70',
    },
    {
      variant: 'outline',
      size: ['icon', 'xs'],
      className: 'border',
    },
    {
      variant: ['ghost', 'link'],
      size: ['lg', 'xl'],
      className: 'font-semibold tracking-wide',
    },
    {
      variant: ['default', 'primary', 'destructive', 'success', 'warning', 'gradient'],
      size: ['lg', 'xl'],
      className: 'shadow-lg',
    },
  ],
  defaultVariants: {
    variant: 'default',
    size: 'default',
    isLoading: false,
    grouped: false,
  },
})

export type ButtonVariants = VariantProps<typeof buttonStyles>
