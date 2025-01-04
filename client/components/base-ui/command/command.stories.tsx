import type { Meta, StoryObj } from '@storybook/react'
import * as Lucide from 'lucide-react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './command'

const meta: Meta = {
  title: 'Basic Components/Command',
  component: Command,
  parameters: {
    docs: {
      description: {
        component: `
Command menu component with keyboard navigation and search functionality.

## Example
\`\`\`tsx
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '#/components/base-ui'

<Command>
  <CommandInput placeholder="Type a command..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>Calendar</CommandItem>
      <CommandItem>Search</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
\`\`\``,
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Lucide.Calendar className="mr-2 size-4" strokeWidth={2} />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <Lucide.Smile className="mr-2 size-4" strokeWidth={2} />
            <span>Search Emoji</span>
          </CommandItem>
          <CommandItem>
            <Lucide.Calculator className="mr-2 size-4" strokeWidth={2} />
            <span>Calculator</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <Lucide.User className="mr-2 size-4" strokeWidth={2} />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Lucide.CreditCard className="mr-2 size-4" strokeWidth={2} />
            <span>Billing</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Lucide.Settings className="mr-2 size-4" strokeWidth={2} />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}

export const WithDialog: Story = {
  render: () => (
    <CommandDialog>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Lucide.Calendar className="mr-2 size-4" strokeWidth={2} />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <Lucide.Smile className="mr-2 size-4" strokeWidth={2} />
            <span>Search Emoji</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  ),
}

export const Empty: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
      </CommandList>
    </Command>
  ),
}

export const WithShortcuts: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandGroup heading="Actions">
          <CommandItem>
            <span>New File</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <span>Save</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <span>Copy</span>
            <CommandShortcut>⌘C</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}
