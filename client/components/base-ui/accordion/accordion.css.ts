import { type VariantProps, tv } from 'tailwind-variants'

export const accordionStyles = tv({
  slots: {
    item: 'border-b',
    trigger:
      'flex flex-1 items-center justify-between font-medium text-sm transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
    content: [
      'overflow-hidden text-sm',
      'data-[state=closed]:motion-translate-y-out-100 data-[state=open]:motion-translate-y-in-100',
      'data-[state=closed]:motion-opacity-out-0 data-[state=open]:motion-opacity-in-100',
      'data-[state=closed]:motion-blur-out-sm data-[state=open]:motion-blur-in-none',
    ],
    contentInner: '',
    icon: 'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
  },
  variants: {
    size: {
      default: {
        trigger: 'py-4',
        contentInner: 'pt-0 pb-4',
      },
      sm: {
        trigger: 'py-2',
        contentInner: 'pt-0 pb-2',
      },
      lg: {
        trigger: 'py-6',
        contentInner: 'pt-0 pb-6',
      },
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export type AccordionVariants = VariantProps<typeof accordionStyles>
