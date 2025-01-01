import { type VariantProps, tv } from 'tailwind-variants'

export const sheetStyles = tv({
  slots: {
    overlay: [
      'fixed inset-0 z-50 bg-black/80',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    ],
    content: [
      'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:duration-300 data-[state=open]:duration-500',
    ],
    header: 'flex flex-col space-y-2 text-center sm:text-left',
    footer: 'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
    title: 'text-lg font-semibold text-foreground',
    description: 'text-sm text-muted-foreground',
    closeButton: [
      'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background',
      'transition-opacity hover:opacity-100',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      'disabled:pointer-events-none',
    ],
    closeIcon: 'size-4',
  },
  variants: {
    side: {
      top: {
        content: [
          'inset-x-0 top-0 border-b',
          'data-[state=closed]:slide-out-to-top',
          'data-[state=open]:slide-in-from-top',
        ],
      },
      bottom: {
        content: [
          'inset-x-0 bottom-0 border-t',
          'data-[state=closed]:slide-out-to-bottom',
          'data-[state=open]:slide-in-from-bottom',
        ],
      },
      left: {
        content: [
          'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
          'data-[state=closed]:slide-out-to-left',
          'data-[state=open]:slide-in-from-left',
        ],
      },
      right: {
        content: [
          'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
          'data-[state=closed]:slide-out-to-right',
          'data-[state=open]:slide-in-from-right',
        ],
      },
    },
    size: {
      default: {},
      sm: {
        content: 'sm:max-w-xs',
      },
      lg: {
        content: 'sm:max-w-lg',
      },
      xl: {
        content: 'sm:max-w-xl',
      },
      full: {
        content: 'sm:max-w-full',
      },
    },
  },
  defaultVariants: {
    side: 'right',
    size: 'default',
  },
})

export type SheetVariants = VariantProps<typeof sheetStyles>
