import { type VariantProps, tv } from 'tailwind-variants'

export const dialogStyles = tv({
  slots: {
    overlay: [
      'fixed inset-0 z-50 bg-black/80',
      'data-[state=closed]:animate-out data-[state=open]:animate-in',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    ],
    content: [
      'fixed top-[50%] left-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%]',
      'gap-4 border bg-background p-6 shadow-lg duration-200',
      'data-[state=closed]:animate-out data-[state=open]:animate-in',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
      'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
      'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
      'sm:rounded-lg',
    ],
    header: 'flex flex-col space-y-1.5 text-center sm:text-left',
    footer: 'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
    title: 'font-semibold text-lg leading-none tracking-tight',
    description: 'text-muted-foreground text-sm',
    closeButton: [
      'absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background',
      'transition-opacity hover:opacity-100',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      'disabled:pointer-events-none',
      'data-[state=open]:bg-accent data-[state=open]:text-muted-foreground',
    ],
    closeIcon: 'size-4',
  },
  variants: {
    size: {
      default: {
        content: 'w-full max-w-lg',
      },
      sm: {
        content: 'w-full max-w-md',
      },
      lg: {
        content: 'w-full max-w-xl',
      },
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export type DialogVariants = VariantProps<typeof dialogStyles>
