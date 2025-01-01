import { type VariantProps, tv } from 'tailwind-variants'

export const sonnerStyles = tv({
  slots: {
    toast: [
      'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground',
      'group-[.toaster]:border-border group-[.toaster]:shadow-lg',
    ],
    description: 'group-[.toast]:text-muted-foreground',
    actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
    cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
    loader: 'group-[.toast]:text-muted-foreground',
    title: 'group-[.toast]:font-semibold',
    closeButton: [
      'group-[.toast]:opacity-70 group-[.toast]:transition-opacity',
      'group-[.toast]:hover:opacity-100',
    ],
  },
  variants: {
    variant: {
      default: {},
      success: {
        toast: 'group-[.toaster]:border-success',
        title: 'group-[.toast]:text-success',
      },
      error: {
        toast: 'group-[.toaster]:border-destructive',
        title: 'group-[.toast]:text-destructive',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export type SonnerVariants = VariantProps<typeof sonnerStyles>
