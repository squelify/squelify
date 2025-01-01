import { CaretSortIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'
import * as SelectPrimitive from '@radix-ui/react-select'
import * as React from 'react'
import { selectStyles } from './select.css'
import type { SelectVariants } from './select.css'

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & SelectVariants
>(({ className, children, size, ...props }, ref) => {
  const styles = selectStyles({ size })
  return (
    <SelectPrimitive.Trigger ref={ref} className={styles.trigger({ className })} {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <CaretSortIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})

const SelectScrollUpButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => {
  const styles = selectStyles()
  return (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      className={styles.scrollButton({ className })}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpButton>
  )
})

const SelectScrollDownButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => {
  const styles = selectStyles()
  return (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      className={styles.scrollButton({ className })}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownButton>
  )
})

const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & SelectVariants
>(({ className, children, position = 'item-aligned', size, ...props }, ref) => {
  const styles = selectStyles({ size })
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={styles.content({ className })}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport className={styles.viewport()}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})

const SelectLabel = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => {
  const styles = selectStyles()
  return <SelectPrimitive.Label ref={ref} className={styles.label({ className })} {...props} />
})

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  const styles = selectStyles()
  return (
    <SelectPrimitive.Item ref={ref} className={styles.item({ className })} {...props}>
      <span className={styles.indicator()}>
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
})

const SelectSeparator = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => {
  const styles = selectStyles()
  return (
    <SelectPrimitive.Separator ref={ref} className={styles.separator({ className })} {...props} />
  )
})

SelectTrigger.displayName = SelectPrimitive.Trigger.displayName
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName
SelectContent.displayName = SelectPrimitive.Content.displayName
SelectLabel.displayName = SelectPrimitive.Label.displayName
SelectItem.displayName = SelectPrimitive.Item.displayName
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
