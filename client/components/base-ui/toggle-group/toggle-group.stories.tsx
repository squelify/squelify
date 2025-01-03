import type { Meta, StoryObj } from '@storybook/react'
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from 'lucide-react'
import type { ToggleVariants } from '../toggle/toggle.css'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'

const variantOptions: NonNullable<ToggleVariants['variant']>[] = ['default', 'outline']
const sizeOptions: NonNullable<ToggleVariants['size']>[] = ['default', 'sm', 'lg']

const meta: Meta = {
  title: 'Basic Components/ToggleGroup',
  component: ToggleGroup,
  parameters: {
    docs: {
      description: {
        component: `
ToggleGroup component for grouping multiple toggles.

## Example Usage
\`\`\`tsx
import { ToggleGroup, ToggleGroupItem } from '#/components/base-ui'

<ToggleGroup type="single">
  <ToggleGroupItem value="left"><AlignLeft /></ToggleGroupItem>
  <ToggleGroupItem value="center"><AlignCenter /></ToggleGroupItem>
</ToggleGroup>
\`\`\``,
      },
    },
  },
  argTypes: {
    type: {
      control: 'inline-radio',
      options: ['single', 'multiple'],
      description: 'Selection type',
    },
    variant: {
      control: 'inline-radio',
      options: variantOptions,
      description: 'Visual variant',
    },
    size: {
      control: 'inline-radio',
      options: sizeOptions,
      description: 'Size variant',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ToggleGroup type="single">
      <ToggleGroupItem value="left" aria-label="Left align">
        <AlignLeft className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Center align">
        <AlignCenter className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Right align">
        <AlignRight className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Multiple: Story = {
  render: () => (
    <ToggleGroup type="multiple">
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <Bold className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <Italic className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">
        <Underline className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ToggleGroup type="single" size="sm">
        <ToggleGroupItem value="left">
          <AlignLeft className="size-3" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center">
          <AlignCenter className="size-3" />
        </ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup type="single">
        <ToggleGroupItem value="left">
          <AlignLeft className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center">
          <AlignCenter className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup type="single" size="lg">
        <ToggleGroupItem value="left">
          <AlignLeft className="size-5" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center">
          <AlignCenter className="size-5" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ToggleGroup type="single" variant="default">
        <ToggleGroupItem value="left">
          <AlignLeft className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center">
          <AlignCenter className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup type="single" variant="outline">
        <ToggleGroupItem value="left">
          <AlignLeft className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center">
          <AlignCenter className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
}
