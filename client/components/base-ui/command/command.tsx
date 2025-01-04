import { type DialogProps } from '@radix-ui/react-dialog'
import { Command as CommandPrimitive } from 'cmdk'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Dialog, DialogContent } from '../dialog/dialog'
import { commandStyles } from './command.css'
import type { CommandVariants } from './command.css'

interface CommandProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive>,
    CommandVariants {}

const Command = React.forwardRef<React.ComponentRef<typeof CommandPrimitive>, CommandProps>(
  ({ className, size, ...props }, ref) => {
    const styles = commandStyles({ size })
    return <CommandPrimitive ref={ref} className={styles.root({ className })} {...props} />
  }
)

const CommandDialog = ({ children, ...props }: DialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

const CommandInput = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => {
  const styles = commandStyles()
  return (
    <div className={styles.inputWrapper()} cmdk-input-wrapper="">
      <Lucide.Search className={styles.icon()} strokeWidth={2} />
      <CommandPrimitive.Input ref={ref} className={styles.input({ className })} {...props} />
    </div>
  )
})

const CommandList = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => {
  const styles = commandStyles()
  return <CommandPrimitive.List ref={ref} className={styles.list({ className })} {...props} />
})

const CommandEmpty = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => {
  const styles = commandStyles()
  return <CommandPrimitive.Empty ref={ref} className={styles.empty()} {...props} />
})

const CommandGroup = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => {
  const styles = commandStyles()
  return <CommandPrimitive.Group ref={ref} className={styles.group({ className })} {...props} />
})

const CommandSeparator = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => {
  const styles = commandStyles()
  return (
    <CommandPrimitive.Separator ref={ref} className={styles.separator({ className })} {...props} />
  )
})

const CommandItem = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => {
  const styles = commandStyles()
  return <CommandPrimitive.Item ref={ref} className={styles.item({ className })} {...props} />
})

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  const styles = commandStyles()
  return <span className={styles.shortcut({ className })} {...props} />
}

Command.displayName = CommandPrimitive.displayName
CommandDialog.displayName = 'CommandDialog'
CommandInput.displayName = CommandPrimitive.Input.displayName
CommandList.displayName = CommandPrimitive.List.displayName
CommandEmpty.displayName = CommandPrimitive.Empty.displayName
CommandGroup.displayName = CommandPrimitive.Group.displayName
CommandSeparator.displayName = CommandPrimitive.Separator.displayName
CommandItem.displayName = CommandPrimitive.Item.displayName
CommandShortcut.displayName = 'CommandShortcut'

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
