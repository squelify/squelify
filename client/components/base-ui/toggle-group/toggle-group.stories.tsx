import type { Meta, StoryObj } from '@storybook/react'
import * as Lucide from 'lucide-react'
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

## Example
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
        <Lucide.AlignLeft className="size-4" strokeWidth={2} />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Center align">
        <Lucide.AlignCenter className="size-4" strokeWidth={2} />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Right align">
        <Lucide.AlignRight className="size-4" strokeWidth={2} />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Multiple: Story = {
  render: () => (
    <ToggleGroup type="multiple">
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <Lucide.Bold className="size-4" strokeWidth={2} />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <Lucide.Italic className="size-4" strokeWidth={2} />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">
        <Lucide.Underline className="size-4" strokeWidth={2} />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ToggleGroup type="single" size="sm">
        <ToggleGroupItem value="left">
          <Lucide.AlignLeft className="size-3" strokeWidth={2} />
        </ToggleGroupItem>
        <ToggleGroupItem value="center">
          <Lucide.AlignCenter className="size-3" strokeWidth={2} />
        </ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup type="single">
        <ToggleGroupItem value="left">
          <Lucide.AlignLeft className="size-4" strokeWidth={2} />
        </ToggleGroupItem>
        <ToggleGroupItem value="center">
          <Lucide.AlignCenter className="size-4" strokeWidth={2} />
        </ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup type="single" size="lg">
        <ToggleGroupItem value="left">
          <Lucide.AlignLeft className="size-5" strokeWidth={2} />
        </ToggleGroupItem>
        <ToggleGroupItem value="center">
          <Lucide.AlignCenter className="size-5" strokeWidth={2} />
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
          <Lucide.AlignLeft className="size-4" strokeWidth={2} />
        </ToggleGroupItem>
        <ToggleGroupItem value="center">
          <Lucide.AlignCenter className="size-4" strokeWidth={2} />
        </ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup type="single" variant="outline">
        <ToggleGroupItem value="left">
          <Lucide.AlignLeft className="size-4" strokeWidth={2} />
        </ToggleGroupItem>
        <ToggleGroupItem value="center">
          <Lucide.AlignCenter className="size-4" strokeWidth={2} />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
}
