import { type VariantProps, tv } from 'tailwind-variants'

export const sheetStyles = tv({
  slots: {
    overlay: [
      'fixed inset-0 z-50 bg-black/80',
      'motion-opacity-in-0',
      'data-[state=closed]:motion-opacity-out-0',
    ],
    content: [
      'fixed z-50 gap-4 bg-background p-6 shadow-lg',
      'motion-opacity-in-0',
      'data-[state=closed]:motion-opacity-out-0',
    ],
    header: 'flex flex-col space-y-2 text-center sm:text-left',
    footer: 'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
    title: 'font-semibold text-foreground text-lg',
    description: 'text-muted-foreground text-sm',
    closeButton: [
      'absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background',
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
          'motion-translate-y-in-100',
          'data-[state=closed]:motion-translate-y-out-100',
        ],
      },
      bottom: {
        content: [
          'inset-x-0 bottom-0 border-t',
          'motion-translate-y-in-100',
          'data-[state=closed]:motion-translate-y-out-100',
        ],
      },
      left: {
        content: [
          'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
          'motion-translate-x-in-100',
          'data-[state=closed]:motion-translate-x-out-100',
        ],
      },
      right: {
        content: [
          'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
          'motion-translate-x-in-100',
          'data-[state=closed]:motion-translate-x-out-100',
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
