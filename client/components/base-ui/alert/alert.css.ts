import { type VariantProps, tv } from 'tailwind-variants'

export const alertStyles = tv({
  slots: {
    root: ['relative w-full rounded-lg border p-4', 'flex items-start gap-3', 'shadow-sm'],
    content: ['flex flex-1 flex-col gap-1'],
    icon: ['mt-0.5 size-5 shrink-0', '[&>svg]:size-full [&>svg]:stroke-[1.5px]'],
    title: 'font-medium text-sm leading-none tracking-tight',
    description: 'text-sm [&_p]:leading-relaxed',
    action: 'shrink-0',
  },
  variants: {
    variant: {
      default: {
        root: 'border-border bg-background text-foreground',
        title: 'text-foreground',
        description: 'text-muted-foreground',
        icon: 'text-foreground',
      },
      info: {
        root: 'border-info/50 bg-info/5',
        title: 'text-info-foreground',
        description: 'text-info-foreground/90',
        icon: 'text-info',
      },
      success: {
        root: 'border-success/50 bg-success/5',
        title: 'text-success-foreground',
        description: 'text-success-foreground/90',
        icon: 'text-success',
      },
      warning: {
        root: 'border-warning/50 bg-warning/5',
        title: 'text-warning-foreground',
        description: 'text-warning-foreground/90',
        icon: 'text-warning',
      },
      error: {
        root: 'border-destructive/50 bg-destructive/5',
        title: 'text-destructive-foreground',
        description: 'text-destructive-foreground/90',
        icon: 'text-destructive',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export type AlertVariants = VariantProps<typeof alertStyles>
