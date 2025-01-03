import { type VariantProps, tv } from 'tailwind-variants'

export const popoverContentStyles = tv({
  base: [
    'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none',
    'motion-opacity-in-0',
    'data-[state=closed]:motion-opacity-out-0',
    'data-[side=bottom]:motion-translate-y-in-25',
    'data-[side=left]:motion-translate-x-in-25',
    'data-[side=right]:motion-translate-x-in-25',
    'data-[side=top]:motion-translate-y-in-25',
    'data-[side=bottom]:data-[state=closed]:motion-translate-y-out-25',
    'data-[side=left]:data-[state=closed]:motion-translate-x-out-25',
    'data-[side=right]:data-[state=closed]:motion-translate-x-out-25',
    'data-[side=top]:data-[state=closed]:motion-translate-y-out-25',
  ],
})

export type PopoverVariants = VariantProps<typeof popoverContentStyles>
