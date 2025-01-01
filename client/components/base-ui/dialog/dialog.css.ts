import { type VariantProps, tv } from 'tailwind-variants'

export const dialogOverlayStyles = tv({
  base: [
    'fixed inset-0 z-50 bg-black/80',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
  ],
})

export const dialogContentStyles = tv({
  base: [
    'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]',
    'gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
    'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
  ],
})

export const dialogHeaderStyles = tv({
  base: 'flex flex-col space-y-1.5 text-center sm:text-left',
})

export const dialogFooterStyles = tv({
  base: 'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
})

export const dialogTitleStyles = tv({
  base: 'font-semibold text-lg leading-none tracking-tight',
})

export const dialogDescriptionStyles = tv({
  base: 'text-muted-foreground text-sm',
})

export type DialogVariants = VariantProps<typeof dialogContentStyles>
