import { type VariantProps, tv } from 'tailwind-variants'

export const contextMenuSubTriggerStyles = tv({
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

export const contextMenuSubContentStyles = tv({
  base: [
    'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
    'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  ],
})

export const contextMenuContentStyles = tv({
  base: [
    'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
    'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  ],
})

export const contextMenuItemStyles = tv({
  base: [
    'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
    'focus:bg-accent focus:text-accent-foreground',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  ],
  variants: {
    inset: {
      true: 'pl-8',
    },
  },
})

export const contextMenuCheckboxItemStyles = tv({
  base: [
    'relative flex cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none',
    'focus:bg-accent focus:text-accent-foreground',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  ],
})

export const contextMenuRadioItemStyles = tv({
  base: [
    'relative flex cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none',
    'focus:bg-accent focus:text-accent-foreground',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  ],
})

export const contextMenuLabelStyles = tv({
  base: 'px-2 py-1.5 font-semibold text-foreground text-sm',
  variants: {
    inset: {
      true: 'pl-8',
    },
  },
})

export const contextMenuSeparatorStyles = tv({
  base: '-mx-1 my-1 h-px bg-border',
})

export const contextMenuShortcutStyles = tv({
  base: 'ml-auto text-muted-foreground text-xs tracking-widest',
})

export type ContextMenuVariants = VariantProps<typeof contextMenuContentStyles>
