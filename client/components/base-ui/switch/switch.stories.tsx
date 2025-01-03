import type { Meta, StoryObj } from '@storybook/react'
import { Label } from '../label/label'
import { Switch } from './switch'
import type { SwitchVariants } from './switch.css'

const sizeOptions: NonNullable<SwitchVariants['size']>[] = ['default', 'sm', 'lg']

const meta: Meta = {
  title: 'Basic Components/Switch',
  component: Switch,
  parameters: {
    docs: {
      description: {
        component: `
Switch component for toggling between two states.

## Example Usage
\`\`\`tsx
import { Switch } from '#/components/base-ui'

<Switch />
<Switch defaultChecked />
\`\`\``,
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: sizeOptions,
      description: 'Switch size',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Default checked state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Switch />,
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Switch size="sm" id="small" />
        <Label htmlFor="small">Small</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="default" />
        <Label htmlFor="default">Default</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch size="lg" id="large" />
        <Label htmlFor="large">Large</Label>
      </div>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Switch defaultChecked />
      <Switch disabled />
      <Switch disabled defaultChecked />
    </div>
  ),
}
