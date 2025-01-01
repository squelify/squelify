import { type VariantProps, tv } from 'tailwind-variants'

export const inputOTPStyles = tv({
  slots: {
    root: 'disabled:cursor-not-allowed',
    container: 'flex items-center gap-2 has-[:disabled]:opacity-50',
    group: 'flex items-center',
    slot: [
      'relative flex items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all',
      'first:rounded-l-md first:border-l last:rounded-r-md',
      'data-[active=true]:z-10 data-[active=true]:ring-1 data-[active=true]:ring-ring',
    ],
    caret: 'pointer-events-none absolute inset-0 flex items-center justify-center',
    caretInner: 'h-4 w-px animate-caret-blink bg-foreground duration-1000',
    separator: 'flex items-center',
  },
  variants: {
    size: {
      default: {
        slot: 'h-9 w-9',
        caretInner: 'h-4',
      },
      sm: {
        slot: 'h-7 w-7',
        caretInner: 'h-3',
      },
      lg: {
        slot: 'h-11 w-11',
        caretInner: 'h-5',
      },
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export type InputOTPVariants = VariantProps<typeof inputOTPStyles>
