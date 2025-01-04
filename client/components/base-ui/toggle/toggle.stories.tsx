import type { Meta, StoryObj } from '@storybook/react'
import * as Lucide from 'lucide-react'
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

## Example
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
      <Lucide.Bold className="size-4" strokeWidth={2} /> Bold
    </Toggle>
  ),
}

export const TextFormatting: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toggle aria-label="Toggle bold">
        <Lucide.Bold className="size-4" strokeWidth={2} />
      </Toggle>
      <Toggle aria-label="Toggle italic">
        <Lucide.Italic className="size-4" strokeWidth={2} />
      </Toggle>
      <Toggle aria-label="Toggle underline">
        <Lucide.Underline className="size-4" strokeWidth={2} />
      </Toggle>
    </div>
  ),
}

export const Alignment: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toggle variant="outline" aria-label="Toggle left align">
        <Lucide.AlignLeft className="size-4" strokeWidth={2} />
      </Toggle>
      <Toggle variant="outline" aria-label="Toggle center align">
        <Lucide.AlignCenter className="size-4" strokeWidth={2} />
      </Toggle>
      <Toggle variant="outline" aria-label="Toggle right align">
        <Lucide.AlignRight className="size-4" strokeWidth={2} />
      </Toggle>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle size="sm">
        <Lucide.Bold className="size-3" strokeWidth={2} /> Small
      </Toggle>
      <Toggle>
        <Lucide.Bold className="size-4" strokeWidth={2} /> Default
      </Toggle>
      <Toggle size="lg">
        <Lucide.Bold className="size-5" strokeWidth={2} /> Large
      </Toggle>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Toggle disabled>
      <Lucide.Bold className="size-4" strokeWidth={2} /> Disabled
    </Toggle>
  ),
}
