import { type VariantProps, tv } from 'tailwind-variants'

export const alertDialogStyles = tv({
  slots: {
    overlay: [
      'fixed inset-0 z-50 bg-black/80',
      'motion-opacity-in-0',
      'data-[state=closed]:motion-opacity-out-0',
    ],
    content: [
      'fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg',
      'gap-4 border bg-background p-6 shadow-lg',
      '-translate-x-1/2 -translate-y-1/2',
      'motion-opacity-in-0 motion-blur-in-sm',
      'data-[state=closed]:motion-opacity-out-0 data-[state=closed]:motion-blur-out-sm',
      'sm:rounded-lg',
    ],
    header: 'flex flex-col space-y-2 text-center sm:text-left',
    footer: 'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
    title: 'font-semibold text-lg',
    description: 'text-muted-foreground text-sm',
    cancel: 'mt-2 sm:mt-0',
    action: '',
  },
  variants: {
    size: {
      default: {
        content: 'max-w-lg',
      },
      sm: {
        content: 'max-w-md',
      },
      lg: {
        content: 'max-w-xl',
      },
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export type AlertDialogVariants = VariantProps<typeof alertDialogStyles>
