import { type VariantProps, tv } from 'tailwind-variants'

export const tooltipContentStyles = tv({
  base: [
    'z-50 overflow-hidden rounded-lg bg-black px-3 py-1.5 text-white text-xs',
    'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
    'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
    'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
    'duration-200 ease-in-out',
  ],
})

export const tooltipArrowStyles = tv({
  base: 'transition-transform duration-200 ease-in-out',
})

export type TooltipVariants = VariantProps<typeof tooltipContentStyles>
