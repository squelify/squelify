import { type VariantProps, tv } from 'tailwind-variants'

export const formStyles = tv({
  slots: {
    item: 'space-y-2',
    label:
      'font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    description: 'text-[0.8rem] text-muted-foreground',
    message: 'font-medium text-[0.8rem] text-destructive',
    control: [
      'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2',
      'text-sm ring-offset-background',
      'file:border-0 file:bg-transparent file:font-medium file:text-sm',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ],
  },
  variants: {
    error: {
      true: {
        label: 'text-destructive',
        control: 'border-destructive focus-visible:ring-destructive',
      },
    },
    size: {
      default: {
        control: 'h-10 px-3 py-2',
      },
      sm: {
        control: 'h-8 px-2 py-1 text-xs',
      },
      lg: {
        control: 'h-12 px-4 py-3 text-base',
      },
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export type FormVariants = VariantProps<typeof formStyles>
