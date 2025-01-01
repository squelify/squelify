import { type VariantProps, tv } from 'tailwind-variants'

export const accordionItemStyles = tv({
  base: 'border-b',
})

export const accordionTriggerStyles = tv({
  base: 'flex flex-1 items-center justify-between py-4 font-medium text-sm transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
})

export const accordionContentStyles = tv({
  base: 'overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
})

export const accordionContentInnerStyles = tv({
  base: 'pt-0 pb-4',
})

export type AccordionVariants = VariantProps<typeof accordionItemStyles>
