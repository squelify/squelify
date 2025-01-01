import { type VariantProps, tv } from 'tailwind-variants'

export const alertDialogOverlayStyles = tv({
  base: 'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=open]:animate-in',
})

export const alertDialogContentStyles = tv({
  base: [
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
    'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
    'fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]',
    'gap-4 border bg-background p-6 shadow-lg duration-200',
    'data-[state=closed]:animate-out data-[state=open]:animate-in sm:rounded-lg',
  ],
})

export const alertDialogHeaderStyles = tv({
  base: 'flex flex-col space-y-2 text-center sm:text-left',
})

export const alertDialogFooterStyles = tv({
  base: 'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
})

export const alertDialogTitleStyles = tv({
  base: 'font-semibold text-lg',
})

export const alertDialogDescriptionStyles = tv({
  base: 'text-muted-foreground text-sm',
})

export type AlertDialogVariants = VariantProps<typeof alertDialogContentStyles>
