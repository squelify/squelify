import { type VariantProps, tv } from 'tailwind-variants'

export const inputStyles = tv({
  base: [
    'flex h-9 w-full rounded-md border border-input bg-transparent',
    'px-3 py-1 text-sm shadow-sm transition-colors',
    'file:border-0 file:bg-transparent file:text-sm',
    'file:font-medium file:text-foreground',
    'placeholder:text-muted-foreground/60 focus:ring-0 focus-visible:ring-1',
    'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-primary/50',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  variants: {
    hasRightIcon: {
      true: 'pr-10',
      false: '',
    },
  },
  defaultVariants: {
    hasRightIcon: false,
  },
})

export const iconButtonStyles = tv({
  base: [
    '-translate-y-1/2 absolute top-1/2 right-3',
    'text-muted-foreground/60 hover:text-muted-foreground',
    'transition-colors duration-200',
  ],
})

export type InputVariants = VariantProps<typeof inputStyles>
