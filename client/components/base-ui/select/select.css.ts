import { type VariantProps, tv } from 'tailwind-variants'

export const selectStyles = tv({
  slots: {
    trigger: [
      'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input',
      'bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background',
      'placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring',
      'disabled:cursor-not-allowed disabled:opacity-50',
      '[&>span]:line-clamp-1',
    ],
    content: [
      'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
      'motion-opacity-in-0 motion-translate-y-in-25',
      'data-[state=closed]:motion-opacity-out-0 data-[state=closed]:motion-translate-y-out-25',
    ],
    viewport: 'p-1',
    item: [
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none',
      'focus:bg-accent focus:text-accent-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    ],
    label: 'px-2 py-1.5 font-semibold text-sm',
    separator: '-mx-1 my-1 h-px bg-muted',
    indicator: 'absolute right-2 flex size-3.5 items-center justify-center',
    scrollButton: 'flex cursor-default items-center justify-center py-1',
  },
  variants: {
    size: {
      default: {
        trigger: 'h-9 px-3 py-2',
        content: 'min-w-[8rem]',
      },
      sm: {
        trigger: 'h-8 px-2.5 py-1.5 text-xs',
        content: 'min-w-[6rem]',
      },
      lg: {
        trigger: 'h-10 px-4 py-2',
        content: 'min-w-[10rem]',
      },
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export type SelectVariants = VariantProps<typeof selectStyles>
