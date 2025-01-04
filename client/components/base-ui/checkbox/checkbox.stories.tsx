import type { Meta, StoryObj } from '@storybook/react'
import { Label } from '../label/label'
import { Checkbox } from './checkbox'
import type { CheckboxVariants } from './checkbox.css'

const sizeOptions: NonNullable<CheckboxVariants['size']>[] = ['default', 'sm', 'lg']

const meta: Meta = {
  title: 'Basic Components/Checkbox',
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component: `
Checkbox component with customizable sizes and states.

## Example
\`\`\`tsx
import { Checkbox } from '#/components/base-ui'

<Checkbox />
<Checkbox defaultChecked />
<Checkbox disabled />
\`\`\``,
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: sizeOptions,
      description: 'Checkbox size variant',
      table: {
        type: { summary: 'CheckboxVariants["size"]' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable checkbox',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Initial checked state',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Checkbox />,
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
}

export const SizeShowcase: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Checkbox size="sm" />
      <Checkbox size="default" />
      <Checkbox size="lg" />
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="default" />
        <Label htmlFor="default">Default</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="checked" defaultChecked />
        <Label htmlFor="checked">Checked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled" disabled />
        <Label htmlFor="disabled">Disabled</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-checked" disabled defaultChecked />
        <Label htmlFor="disabled-checked">Disabled Checked</Label>
      </div>
    </div>
  ),
}
