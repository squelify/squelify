import { type VariantProps, tv } from 'tailwind-variants'

export const dropdownMenuSubTriggerStyles = tv({
  base: [
    'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
    'focus:bg-accent focus:text-accent-foreground',
    'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
  ],
  variants: {
    inset: {
      true: 'pl-8',
    },
  },
})

export const dropdownMenuSubContentStyles = tv({
  base: [
    'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
    'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  ],
})

export const dropdownMenuContentStyles = tv({
  base: [
    'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
    'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  ],
})

export const dropdownMenuItemStyles = tv({
  base: [
    'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none',
    'focus:bg-accent focus:text-accent-foreground',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    '[&>svg]:size-4 [&>svg]:shrink-0',
  ],
  variants: {
    inset: {
      true: 'pl-8',
    },
  },
})

export const dropdownMenuCheckboxItemStyles = tv({
  base: [
    'relative flex cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none',
    'focus:bg-accent focus:text-accent-foreground',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  ],
})

export const dropdownMenuRadioItemStyles = tv({
  base: [
    'relative flex cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none',
    'focus:bg-accent focus:text-accent-foreground',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  ],
})

export const dropdownMenuLabelStyles = tv({
  base: 'px-2 py-1.5 font-semibold text-sm',
  variants: {
    inset: {
      true: 'pl-8',
    },
  },
})

export const dropdownMenuSeparatorStyles = tv({
  base: '-mx-1 my-1 h-px bg-muted',
})

export const dropdownMenuShortcutStyles = tv({
  base: 'ml-auto text-xs tracking-widest opacity-60',
})

export type DropdownMenuVariants = VariantProps<typeof dropdownMenuContentStyles>
