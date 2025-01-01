import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { contextMenuStyles } from './context-menu.css'
import type { ContextMenuVariants } from './context-menu.css'

const ContextMenu = ContextMenuPrimitive.Root
const ContextMenuTrigger = ContextMenuPrimitive.Trigger
const ContextMenuGroup = ContextMenuPrimitive.Group
const ContextMenuPortal = ContextMenuPrimitive.Portal
const ContextMenuSub = ContextMenuPrimitive.Sub
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup

const ContextMenuSubTrigger = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & ContextMenuVariants
>(({ className, inset, size, children, ...props }, ref) => {
  const styles = contextMenuStyles({ inset, size })
  return (
    <ContextMenuPrimitive.SubTrigger
      ref={ref}
      className={styles.subTrigger({ className })}
      {...props}
    >
      {children}
      <Lucide.ChevronRight className={styles.icon()} />
    </ContextMenuPrimitive.SubTrigger>
  )
})

const ContextMenuSubContent = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent> & ContextMenuVariants
>(({ className, size, ...props }, ref) => {
  const styles = contextMenuStyles({ size })
  return (
    <ContextMenuPrimitive.SubContent
      ref={ref}
      className={styles.subContent({ className })}
      {...props}
    />
  )
})

const ContextMenuContent = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content> & ContextMenuVariants
>(({ className, size, ...props }, ref) => {
  const styles = contextMenuStyles({ size })
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        ref={ref}
        className={styles.content({ className })}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  )
})

const ContextMenuItem = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & ContextMenuVariants
>(({ className, inset, ...props }, ref) => {
  const styles = contextMenuStyles({ inset })
  return <ContextMenuPrimitive.Item ref={ref} className={styles.item({ className })} {...props} />
})

const ContextMenuCheckboxItem = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => {
  const styles = contextMenuStyles()
  return (
    <ContextMenuPrimitive.CheckboxItem
      ref={ref}
      className={styles.checkboxItem({ className })}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <Lucide.Check className={styles.icon()} />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  )
})

const ContextMenuRadioItem = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => {
  const styles = contextMenuStyles()
  return (
    <ContextMenuPrimitive.RadioItem
      ref={ref}
      className={styles.radioItem({ className })}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <Lucide.Circle className={styles.icon()} />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  )
})

const ContextMenuLabel = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & ContextMenuVariants
>(({ className, inset, ...props }, ref) => {
  const styles = contextMenuStyles({ inset })
  return <ContextMenuPrimitive.Label ref={ref} className={styles.label({ className })} {...props} />
})

const ContextMenuSeparator = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => {
  const styles = contextMenuStyles()
  return (
    <ContextMenuPrimitive.Separator
      ref={ref}
      className={styles.separator({ className })}
      {...props}
    />
  )
})

const ContextMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  const styles = contextMenuStyles()
  return <span className={styles.shortcut({ className })} {...props} />
}

ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName
ContextMenuCheckboxItem.displayName = ContextMenuPrimitive.CheckboxItem.displayName
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName
ContextMenuShortcut.displayName = 'ContextMenuShortcut'

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
