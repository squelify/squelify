import type { LucideIcon } from 'lucide-react'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import {
  CommandDialog,
  CommandFooter,
  CommandFooterKeyBox,
  CommandSeparator,
  CommandShortcut,
  Link,
} from '#/components/base-ui'
import { CommandEmpty, CommandGroup, CommandInput } from '#/components/base-ui'
import { Button, CommandItem, CommandList } from '#/components/base-ui'

interface CommandMenuItem {
  id: string
  icon: React.ElementType | LucideIcon
  label: string
  shortcut?: string
  onSelect?: () => void
}

export interface CommandMenuGroup {
  id: string
  heading: string
  items: CommandMenuItem[]
  showSeparator?: boolean
}

interface AppCommandProps {
  commandKey?: string
  menuItems: CommandMenuGroup[]
}

export default function AppCommand({ commandKey = 'k', menuItems }: AppCommandProps) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === commandKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [commandKey])

  const handleSelect = (item: CommandMenuItem) => {
    item.onSelect?.()
    setOpen(false)
  }

  return (
    <React.Fragment>
      <Button
        onClick={() => setOpen(!open)}
        className="flex w-full select-none justify-between rounded-lg border border-input bg-background/10 py-1.5 pr-2 pl-2.5 text-muted-foreground text-xs shadow-none transition-colors hover:bg-secondary/60"
        variant="secondary"
      >
        <span>Quick Action</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-sm border bg-muted px-1.5 font-medium font-mono text-[10px] text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {menuItems.map((group) => (
            <React.Fragment key={group.id}>
              <CommandGroup heading={group.heading}>
                {group.items.map((item) => {
                  return (
                    <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
                      <item.icon className="mr-2 size-4" />
                      <span>{item.label}</span>
                      {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              {group.showSeparator && <CommandSeparator />}
            </React.Fragment>
          ))}
        </CommandList>
        <CommandFooter>
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <CommandFooterKeyBox>
                <Lucide.ArrowUp className="size-4" strokeWidth={1.8} />
              </CommandFooterKeyBox>
              <CommandFooterKeyBox>
                <Lucide.ArrowDown className="size-4" strokeWidth={1.8} />
              </CommandFooterKeyBox>
              <span className="font-medium text-muted-foreground text-xs">Navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <CommandFooterKeyBox>
                <Lucide.CornerDownLeft className="size-4" strokeWidth={1.8} />
              </CommandFooterKeyBox>
              <span className="font-medium text-muted-foreground text-xs">Select</span>
            </div>
          </div>

          <div className="text-right text-muted-foreground text-xs">
            <span className="sr-only">Not what you&apos;re looking for?</span>
            <Button size="sm" variant="ghost" asChild>
              <Link href="https://squelify.com/docs" newTab>
                Help Center
              </Link>
            </Button>
          </div>
        </CommandFooter>
      </CommandDialog>
    </React.Fragment>
  )
}
