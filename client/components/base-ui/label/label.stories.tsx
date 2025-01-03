import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox } from '../checkbox/checkbox'
import { Input } from '../input/input'
import { Switch } from '../switch/switch'
import { Label } from './label'

const meta: Meta = {
  title: 'Basic Components/Label',
  component: Label,
  parameters: {
    docs: {
      description: {
        component: `
Label component for form controls with accessible markup.

## Example Usage
\`\`\`tsx
import { Label } from '#/components/base-ui'

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
\`\`\``,
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
  ),
}

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
}

export const WithSwitch: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
}

export const Required: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="username" className="after:text-red-500 after:content-['*']">
        Username
      </Label>
      <Input id="username" required />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="disabled-input">Disabled Label</Label>
      <Input id="disabled-input" disabled />
    </div>
  ),
}
