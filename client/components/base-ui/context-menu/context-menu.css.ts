import { type VariantProps, tv } from 'tailwind-variants'

export const contextMenuStyles = tv({
  slots: {
    content: [
      'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1',
      'motion-opacity-in-0 data-[state=closed]:motion-opacity-out-0 text-popover-foreground shadow-md',
    ],
    item: [
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
      'focus:bg-accent focus:text-accent-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    ],
    checkboxItem: [
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none',
      'focus:bg-accent focus:text-accent-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    ],
    radioItem: [
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none',
      'focus:bg-accent focus:text-accent-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    ],
    label: 'px-2 py-1.5 font-semibold text-foreground text-sm',
    separator: '-mx-1 my-1 h-px bg-border',
    shortcut: 'ml-auto text-muted-foreground text-xs tracking-widest',
    subTrigger: [
      'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
      'focus:bg-accent focus:text-accent-foreground',
      'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
    ],
    subContent: [
      'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1',
      'text-popover-foreground shadow-lg',
      'motion-opacity-in-0',
      'data-[state=closed]:motion-opacity-out-0',
    ],
    icon: 'ml-auto h-4 w-4',
  },
  variants: {
    inset: {
      true: {
        item: 'pl-8',
        label: 'pl-8',
        subTrigger: 'pl-8',
      },
    },
    size: {
      default: {
        content: 'min-w-[8rem]',
        subContent: 'min-w-[8rem]',
      },
      sm: {
        content: 'min-w-[6rem]',
        subContent: 'min-w-[6rem]',
      },
      lg: {
        content: 'min-w-[12rem]',
        subContent: 'min-w-[12rem]',
      },
    },
  },
  defaultVariants: {
    inset: false,
    size: 'default',
  },
})

export type ContextMenuVariants = VariantProps<typeof contextMenuStyles>
