import { type VariantProps, tv } from 'tailwind-variants'

export const tooltipStyles = tv({
  slots: {
    content: [
      'z-50 overflow-hidden rounded-lg bg-black px-3 py-1.5 text-white text-xs',
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
    arrow: 'fill-current',
  },
  variants: {
    size: {
      default: {
        content: 'px-3 py-1.5 text-xs',
      },
      sm: {
        content: 'px-2 py-1 text-xs',
      },
      lg: {
        content: 'px-4 py-2 text-sm',
      },
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export type TooltipVariants = VariantProps<typeof tooltipStyles>
