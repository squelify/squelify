import { type VariantProps, tv } from 'tailwind-variants'

export const paginationStyles = tv({
  slots: {
    root: 'mx-auto flex w-full justify-center',
    content: 'flex flex-row items-center gap-1',
    item: '',
    link: [
      'flex items-center gap-1 rounded-md text-sm font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
    ],
    ellipsis: 'flex h-9 w-9 items-center justify-center',
    icon: 'size-4',
  },
  variants: {
    variant: {
      outline: {
        link: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      },
      ghost: {
        link: 'hover:bg-accent hover:text-accent-foreground',
      },
    },
    size: {
      default: {
        link: 'h-9 px-4',
        ellipsis: 'h-9 w-9',
      },
      sm: {
        link: 'h-7 px-3',
        ellipsis: 'h-7 w-7',
      },
      lg: {
        link: 'h-11 px-6',
        ellipsis: 'h-11 w-11',
      },
    },
    isActive: {
      true: {
        link: 'bg-accent text-accent-foreground',
      },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'default',
  },
})

export type PaginationVariants = VariantProps<typeof paginationStyles>
