import { type VariantProps, tv } from 'tailwind-variants'

export const sheetOverlayStyles = tv({
  base: [
    'fixed inset-0 z-50 bg-black/80',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
  ],
})

export const sheetStyles = tv({
  base: [
    'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:duration-300 data-[state=open]:duration-500',
  ],
  variants: {
    side: {
      top: [
        'inset-x-0 top-0 border-b',
        'data-[state=closed]:slide-out-to-top',
        'data-[state=open]:slide-in-from-top',
      ],
      bottom: [
        'inset-x-0 bottom-0 border-t',
        'data-[state=closed]:slide-out-to-bottom',
        'data-[state=open]:slide-in-from-bottom',
      ],
      left: [
        'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
        'data-[state=closed]:slide-out-to-left',
        'data-[state=open]:slide-in-from-left',
      ],
      right: [
        'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
        'data-[state=closed]:slide-out-to-right',
        'data-[state=open]:slide-in-from-right',
      ],
    },
  },
  defaultVariants: {
    side: 'right',
  },
})

export const sheetHeaderStyles = tv({
  base: 'flex flex-col space-y-2 text-center sm:text-left',
})

export const sheetFooterStyles = tv({
  base: 'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
})

export const sheetTitleStyles = tv({
  base: 'font-semibold text-foreground text-lg',
})

export const sheetDescriptionStyles = tv({
  base: 'text-muted-foreground text-sm',
})

export type SheetVariants = VariantProps<typeof sheetStyles>
