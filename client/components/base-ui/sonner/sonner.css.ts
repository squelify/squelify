import { type VariantProps, tv } from 'tailwind-variants'

export const toastStyles = tv({
  base: [
    'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground',
    'group-[.toaster]:border-border group-[.toaster]:shadow-lg',
  ],
})

export const toastDescriptionStyles = tv({
  base: 'group-[.toast]:text-muted-foreground',
})

export const toastActionButtonStyles = tv({
  base: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
})

export const toastCancelButtonStyles = tv({
  base: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
})

export type ToastVariants = VariantProps<typeof toastStyles>
