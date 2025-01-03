import { type VariantProps, tv } from 'tailwind-variants'

export const dropdownMenuStyles = tv({
  slots: {
    content: [
      'z-50 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
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
    item: [
      'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none',
      'focus:bg-accent focus:text-accent-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      '[&>svg]:size-4 [&>svg]:shrink-0',
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
    label: 'px-2 py-1.5 font-semibold text-sm',
    separator: '-mx-1 my-1 h-px bg-muted',
    shortcut: 'ml-auto text-xs tracking-widest opacity-60',
    subTrigger: [
      'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
      'focus:bg-accent focus:text-accent-foreground',
      'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
    ],
    subContent: [
      'z-50 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg',
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
    icon: 'ml-auto size-4',
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
    size: 'default',
  },
})

export type DropdownMenuVariants = VariantProps<typeof dropdownMenuStyles>
