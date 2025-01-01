import { type VariantProps, tv } from 'tailwind-variants'

export const breadcrumbStyles = tv({
  slots: {
    list: 'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5',
    item: 'inline-flex items-center gap-1.5',
    link: 'transition-colors hover:text-foreground',
    page: 'font-normal text-foreground',
    separator: '[&>svg]:h-3.5 [&>svg]:w-3.5',
    ellipsis: 'flex h-9 w-9 items-center justify-center',
    icon: 'size-4',
  },
  variants: {
    size: {
      default: {
        list: 'text-sm',
        link: 'text-sm',
      },
      sm: {
        list: 'text-xs',
        link: 'text-xs',
      },
      lg: {
        list: 'text-base',
        link: 'text-base',
      },
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export type BreadcrumbVariants = VariantProps<typeof breadcrumbStyles>
