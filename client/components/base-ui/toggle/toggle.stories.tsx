import type { Meta, StoryObj } from '@storybook/react'
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from 'lucide-react'
import { Toggle } from './toggle'
import type { ToggleVariants } from './toggle.css'

const variantOptions: NonNullable<ToggleVariants['variant']>[] = ['default', 'outline']
const sizeOptions: NonNullable<ToggleVariants['size']>[] = ['default', 'sm', 'lg']

const meta: Meta = {
  title: 'Basic Components/Toggle',
  component: Toggle,
  parameters: {
    docs: {
      description: {
        component: `
Toggle component for switching between two states.

## Example Usage
\`\`\`tsx
import { Toggle } from '#/components/base-ui'

<Toggle>
  <Bold className="size-4" /> Bold
</Toggle>
\`\`\``,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: variantOptions,
      description: 'Toggle variant',
    },
    size: {
      control: 'inline-radio',
      options: sizeOptions,
      description: 'Toggle size',
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
  render: () => (
    <Toggle>
      <Bold className="size-4" /> Bold
    </Toggle>
  ),
}

export const TextFormatting: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toggle aria-label="Toggle bold">
        <Bold className="size-4" />
      </Toggle>
      <Toggle aria-label="Toggle italic">
        <Italic className="size-4" />
      </Toggle>
      <Toggle aria-label="Toggle underline">
        <Underline className="size-4" />
      </Toggle>
    </div>
  ),
}

export const Alignment: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toggle variant="outline" aria-label="Toggle left align">
        <AlignLeft className="size-4" />
      </Toggle>
      <Toggle variant="outline" aria-label="Toggle center align">
        <AlignCenter className="size-4" />
      </Toggle>
      <Toggle variant="outline" aria-label="Toggle right align">
        <AlignRight className="size-4" />
      </Toggle>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle size="sm">
        <Bold className="size-3" /> Small
      </Toggle>
      <Toggle>
        <Bold className="size-4" /> Default
      </Toggle>
      <Toggle size="lg">
        <Bold className="size-5" /> Large
      </Toggle>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Toggle disabled>
      <Bold className="size-4" /> Disabled
    </Toggle>
  ),
}
