import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './input'
import type { InputVariants } from './input.css'

const sizeOptions: NonNullable<InputVariants['size']>[] = ['default', 'sm', 'lg']

const meta: Meta = {
  title: 'Basic Components/Input',
  component: Input,
  parameters: {
    docs: {
      description: {
        component: `
Input component with various styles and features.

## Example
\`\`\`tsx
import { Input } from '#/components/base-ui'

// Basic usage
<Input placeholder="Enter text" />

// With copy button
<Input showCopyButton value="Copyable text" />

// Password input
<Input type="password" />

// External copy button
<Input showExternalCopyButton value="Copy me" />
\`\`\``,
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: sizeOptions,
      description: 'Input size variant',
    },
    type: {
      control: 'text',
      description: 'Input type',
    },
    placeholder: {
      control: 'text',
      description: 'Input placeholder',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable input',
    },
    showCopyButton: {
      control: 'boolean',
      description: 'Show inline copy button',
    },
    showExternalCopyButton: {
      control: 'boolean',
      description: 'Show external copy button',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Input placeholder="Enter text" />,
}

export const SizeVariants: Story = {
  render: () => (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Input size="sm" placeholder="Small input" />
      <Input size="default" placeholder="Default input" />
      <Input size="lg" placeholder="Large input" />
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Input placeholder="Default" />
      <Input placeholder="Disabled" disabled />
      <Input placeholder="With value" value="Input value" />
      <Input type="password" placeholder="Password" />
    </div>
  ),
}

export const WithCopyButton: Story = {
  render: () => (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Input showCopyButton value="Click to copy this text" />
      <Input showExternalCopyButton value="Copy with external button" />
    </div>
  ),
}

export const WithTypes: Story = {
  render: () => (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Input type="email" placeholder="Email" />
      <Input type="password" placeholder="Password" />
      <Input type="date" />
      <Input type="number" placeholder="Number" />
      <Input type="tel" placeholder="Phone number" />
    </div>
  ),
}
