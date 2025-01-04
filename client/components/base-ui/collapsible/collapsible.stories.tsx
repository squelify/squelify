import type { Meta, StoryObj } from '@storybook/react'
import * as Lucide from 'lucide-react'
import { Button } from '../button/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'

const meta: Meta = {
  title: 'Basic Components/Collapsible',
  component: Collapsible,
  parameters: {
    docs: {
      description: {
        component: `
Collapsible component for showing and hiding content.

## Example
\`\`\`tsx
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '#/components/base-ui'

<Collapsible>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>Content</CollapsibleContent>
</Collapsible>
\`\`\``,
      },
    },
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controlled open state',
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Initial open state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable collapsible',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Collapsible className="w-[350px] space-y-2">
      <div className="flex items-center justify-between space-x-4 px-4">
        <h4 className="font-semibold text-sm">@peduarte starred 3 repositories</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <Lucide.ChevronsUpDown className="size-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-4 py-2 font-mono text-sm">@radix-ui/primitives</div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-2 font-mono text-sm">@radix-ui/colors</div>
        <div className="rounded-md border px-4 py-2 font-mono text-sm">@stitches/react</div>
      </CollapsibleContent>
    </Collapsible>
  ),
}

export const Controlled: Story = {
  render: () => (
    <Collapsible defaultOpen className="w-[350px] space-y-2">
      <div className="flex items-center justify-between space-x-4 px-4">
        <h4 className="font-semibold text-sm">Controlled Example</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <Lucide.ChevronsUpDown className="size-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-2 font-mono text-sm">Content 1</div>
        <div className="rounded-md border px-4 py-2 font-mono text-sm">Content 2</div>
      </CollapsibleContent>
    </Collapsible>
  ),
}

export const WithCustomTrigger: Story = {
  render: () => (
    <Collapsible className="w-[350px] space-y-2">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          Click to expand
          <Lucide.ChevronsUpDown className="size-4" strokeWidth={2} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-2 font-mono text-sm">Content 1</div>
        <div className="rounded-md border px-4 py-2 font-mono text-sm">Content 2</div>
      </CollapsibleContent>
    </Collapsible>
  ),
}
