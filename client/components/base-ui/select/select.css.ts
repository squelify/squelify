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
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
      'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
      'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
    ],
    viewport: 'p-1',
    item: [
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none',
      'focus:bg-accent focus:text-accent-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    ],
    label: 'px-2 py-1.5 text-sm font-semibold',
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
