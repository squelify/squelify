import type { Meta, StoryObj } from '@storybook/react'
import { Slider } from './slider'
import type { SliderVariants } from './slider.css'

const sizeOptions: NonNullable<SliderVariants['size']>[] = ['default', 'sm', 'lg']

const meta: Meta = {
  title: 'Basic Components/Slider',
  component: Slider,
  parameters: {
    docs: {
      description: {
        component: `
Slider component for selecting numeric values.

## Example Usage
\`\`\`tsx
import { Slider } from '#/components/base-ui'

<Slider defaultValue={[50]} max={100} step={1} />
\`\`\``,
      },
    },
  },
  argTypes: {
    defaultValue: {
      control: 'object',
      description: 'Default slider value(s)',
    },
    min: {
      control: 'number',
      description: 'Minimum value',
    },
    max: {
      control: 'number',
      description: 'Maximum value',
    },
    step: {
      control: 'number',
      description: 'Step increment',
    },
    size: {
      control: 'inline-radio',
      options: sizeOptions,
      description: 'Slider size',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-[60%]">
      <Slider defaultValue={[50]} max={100} step={1} />
    </div>
  ),
}

export const Range: Story = {
  render: () => (
    <div className="w-[60%]">
      <Slider defaultValue={[25, 75]} max={100} step={1} />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex w-[60%] flex-col gap-8">
      <Slider defaultValue={[25]} max={100} step={1} size="sm" />
      <Slider defaultValue={[50]} max={100} step={1} size="default" />
      <Slider defaultValue={[75]} max={100} step={1} size="lg" />
    </div>
  ),
}

export const Steps: Story = {
  render: () => (
    <div className="w-[60%]">
      <Slider defaultValue={[50]} max={100} step={10} />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="w-[60%]">
      <Slider defaultValue={[50]} max={100} step={1} disabled />
    </div>
  ),
}
