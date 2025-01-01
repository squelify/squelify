import { type VariantProps, tv } from 'tailwind-variants'

export const inputOTPStyles = tv({
  base: 'disabled:cursor-not-allowed',
  variants: {
    container: {
      true: 'flex items-center gap-2 has-[:disabled]:opacity-50',
    },
  },
})

export const inputOTPGroupStyles = tv({
  base: 'flex items-center',
})

export const inputOTPSlotStyles = tv({
  base: [
    'relative flex h-9 w-9 items-center justify-center border-input border-y border-r text-sm shadow-sm transition-all',
    'first:rounded-l-md first:border-l last:rounded-r-md',
    'data-[active=true]:z-10 data-[active=true]:ring-1 data-[active=true]:ring-ring',
  ],
})

export const inputOTPCaretStyles = tv({
  base: 'pointer-events-none absolute inset-0 flex items-center justify-center',
})

export const inputOTPCaretInnerStyles = tv({
  base: 'h-4 w-px animate-caret-blink bg-foreground duration-1000',
})

export type InputOTPVariants = VariantProps<typeof inputOTPStyles>
