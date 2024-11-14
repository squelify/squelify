import * as Lucide from 'lucide-react'
import { useEffect, useState } from 'react'
import { CommandDialog, CommandSeparator, CommandShortcut } from '#/components/base-ui/command'
import { CommandEmpty, CommandGroup, CommandInput } from '#/components/base-ui/command'
import { CommandItem, CommandList } from '#/components/base-ui/command'
import { Button } from '../components/base-ui/button'

export default function AppCommand({ logout }: { logout: () => void }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <>
      <Button
        onClick={() => setOpen(!open)}
        className="flex w-full select-none justify-between rounded-lg border border-input bg-background py-1.5 pr-2 pl-2.5 text-muted-foreground text-xs shadow-none transition-colors"
        variant="secondary"
      >
        <span>Open command</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Main Navigation">
            <CommandItem>
              <Lucide.Home className="mr-2 size-4" />
              <span>Dashboard</span>
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="User Management">
            <CommandItem>
              <Lucide.Users className="mr-2 size-4" />
              <span>Users</span>
            </CommandItem>
            <CommandItem>
              <Lucide.Shield className="mr-2 size-4" />
              <span>Roles</span>
            </CommandItem>
            <CommandItem>
              <Lucide.Lock className="mr-2 size-4" />
              <span>Permissions</span>
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Content">
            <CommandItem>
              <Lucide.Database className="mr-2 size-4" />
              <span>Collections</span>
            </CommandItem>
            <CommandItem>
              <Lucide.Image className="mr-2 size-4" />
              <span>Media Library</span>
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="System">
            <CommandItem>
              <Lucide.ScrollText className="mr-2 size-4" />
              <span>Audit Logs</span>
            </CommandItem>
            <CommandItem>
              <Lucide.Webhook className="mr-2 size-4" />
              <span>Webhooks</span>
            </CommandItem>
            <CommandItem>
              <Lucide.Key className="mr-2 size-4" />
              <span>API Keys</span>
            </CommandItem>
            <CommandItem>
              <Lucide.Settings2 className="mr-2 size-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Account">
            <CommandItem>
              <Lucide.User className="mr-2 size-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={logout}>
              <Lucide.LogOut className="mr-2 size-4" />
              <span>Sign out</span>
              <CommandShortcut>⌘Q</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
