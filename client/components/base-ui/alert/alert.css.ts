import { type VariantProps, tv } from 'tailwind-variants'

export const alertStyles = tv({
  slots: {
    root: 'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:top-4 [&>svg]:left-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
    title: 'mb-1 font-medium leading-none tracking-tight',
    description: 'text-sm [&_p]:leading-relaxed',
    icon: '',
  },
  variants: {
    variant: {
      default: {
        root: 'bg-background text-foreground',
      },
      destructive: {
        root: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export type AlertVariants = VariantProps<typeof alertStyles>
