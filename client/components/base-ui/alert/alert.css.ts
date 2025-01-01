import { type VariantProps, tv } from 'tailwind-variants'

export const alertStyles = tv({
  base: 'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:top-4 [&>svg]:left-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
  variants: {
    variant: {
      default: 'bg-background text-foreground',
      destructive:
        'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export const alertTitleStyles = tv({
  base: 'mb-1 font-medium leading-none tracking-tight',
})

export const alertDescriptionStyles = tv({
  base: 'text-sm [&_p]:leading-relaxed',
})

export type AlertVariants = VariantProps<typeof alertStyles>
