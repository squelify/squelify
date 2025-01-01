import { type VariantProps, tv } from 'tailwind-variants'

export const switchStyles = tv({
  slots: {
    root: [
      'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm',
      'transition-colors focus:ring-0 focus-visible:outline-none focus-visible:ring-1',
      'focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
    ],
    thumb: [
      'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform',
      'data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
    ],
  },
  variants: {
    size: {
      default: {
        root: 'h-5 w-9',
        thumb: 'size-4',
      },
      sm: {
        root: 'h-4 w-7',
        thumb: 'size-3',
      },
      lg: {
        root: 'h-6 w-11',
        thumb: 'size-5',
      },
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export type SwitchVariants = VariantProps<typeof switchStyles>
