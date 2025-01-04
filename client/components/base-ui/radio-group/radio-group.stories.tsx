import type { Meta, StoryObj } from '@storybook/react'
import { Label } from '../label/label'
import { RadioGroup, RadioGroupItem } from './radio-group'
import type { RadioGroupVariants } from './radio-group.css'

const sizeOptions: NonNullable<RadioGroupVariants['size']>[] = ['default', 'sm', 'lg']

const meta: Meta = {
  title: 'Basic Components/RadioGroup',
  component: RadioGroup,
  parameters: {
    docs: {
      description: {
        component: `
RadioGroup component for selecting a single option from a list.

## Example
\`\`\`tsx
import { RadioGroup, RadioGroupItem } from '#/components/base-ui'

<RadioGroup defaultValue="option-1">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-1" id="option-1" />
    <Label htmlFor="option-1">Option 1</Label>
  </div>
</RadioGroup>
\`\`\``,
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: sizeOptions,
      description: 'Radio button size',
    },
    defaultValue: {
      control: 'text',
      description: 'Default selected value',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="comfortable">
      <div className="flex flex-col gap-2">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="default" id="r1" />
          <Label htmlFor="r1">Default</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="comfortable" id="r2" />
          <Label htmlFor="r2">Comfortable</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="compact" id="r3" />
          <Label htmlFor="r3">Compact</Label>
        </div>
      </div>
    </RadioGroup>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <RadioGroup size="sm">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="small" id="small" />
          <Label htmlFor="small">Small</Label>
        </div>
      </RadioGroup>

      <RadioGroup>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="default" id="default" />
          <Label htmlFor="default">Default</Label>
        </div>
      </RadioGroup>

      <RadioGroup size="lg">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="large" id="large" />
          <Label htmlFor="large">Large</Label>
        </div>
      </RadioGroup>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option-2" disabled>
      <div className="flex flex-col gap-2">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-1" id="option-1" />
          <Label htmlFor="option-1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option-2" id="option-2" />
          <Label htmlFor="option-2">Option 2</Label>
        </div>
      </div>
    </RadioGroup>
  ),
}
