import type { Meta, StoryObj } from '@storybook/react'
import { Settings2 } from 'lucide-react'
import { Button } from '../button/button'
import { Input } from '../input/input'
import { Label } from '../label/label'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

const meta: Meta = {
  title: 'Basic Components/Popover',
  component: Popover,
  parameters: {
    docs: {
      description: {
        component: `
Popover component displays floating content when a trigger element is clicked.

## Example Usage
\`\`\`tsx
import { Popover, PopoverTrigger, PopoverContent } from '#/components/base-ui'

<Popover>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent>Popover content</PopoverContent>
</Popover>
\`\`\``,
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-muted-foreground text-sm">Set the dimensions for the layer.</p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings2 className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Settings</h4>
            <p className="text-muted-foreground text-sm">Manage your application settings.</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

export const SimpleContent: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Show Info</Button>
      </PopoverTrigger>
      <PopoverContent>Simple popover content with basic text.</PopoverContent>
    </Popover>
  ),
}
