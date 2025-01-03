import { type VariantProps, tv } from 'tailwind-variants'

export const inputStyles = tv({
  slots: {
    wrapper: 'relative flex-1',
    container: 'flex gap-2',
    input: [
      'flex h-9 w-full rounded-md border border-input bg-transparent',
      'px-3 py-1 text-sm shadow-sm transition-colors',
      'file:border-0 file:bg-transparent file:text-sm',
      'file:font-medium file:text-foreground',
      'placeholder:text-muted-foreground/60 focus:ring-0 focus-visible:ring-1',
      'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-primary/50',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ],
    iconButton: [
      '-translate-y-1/2 absolute top-1/2 right-3',
      'text-muted-foreground/60 hover:text-muted-foreground',
      'cursor-pointer transition-colors duration-200',
    ],
    icon: 'size-4',
  },
  variants: {
    hasRightIcon: {
      true: {
        input: 'pr-10',
      },
    },
    size: {
      default: {
        input: 'h-9 px-3 py-1',
        icon: 'size-4',
      },
      sm: {
        input: 'h-8 px-2 py-1 text-xs',
        icon: 'size-3',
      },
      lg: {
        input: 'h-10 px-4 py-2',
        icon: 'size-5',
      },
    },
  },
  defaultVariants: {
    hasRightIcon: false,
    size: 'default',
  },
})

export type InputVariants = VariantProps<typeof inputStyles>
