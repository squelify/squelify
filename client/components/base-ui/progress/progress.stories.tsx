import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'
import { Progress } from './progress'
import type { ProgressVariants } from './progress.css'

const sizeOptions: NonNullable<ProgressVariants['size']>[] = ['default', 'sm', 'lg']

const meta: Meta = {
  title: 'Basic Components/Progress',
  component: Progress,
  parameters: {
    docs: {
      description: {
        component: `
Progress component displays a progress bar with customizable sizes.

## Example
\`\`\`tsx
import { Progress } from '#/components/base-ui'

<Progress value={32} />
\`\`\``,
      },
    },
  },
  argTypes: {
    value: {
      control: { type: 'number', min: 0, max: 100 },
      description: 'Progress value (0-100)',
    },
    size: {
      control: 'inline-radio',
      options: sizeOptions,
      description: 'Progress bar size',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Progress value={60} />,
}

export const Sizes: Story = {
  render: () => (
    <div className="flex w-full flex-col gap-4">
      <Progress value={60} size="sm" />
      <Progress value={60} size="default" />
      <Progress value={60} size="lg" />
    </div>
  ),
}

export const Loading: Story = {
  render: function LoadingProgress() {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
      const timer = setTimeout(() => {
        setProgress(66)
      }, 500)
      return () => clearTimeout(timer)
    }, [])

    return <Progress value={progress} />
  },
}

export const Indeterminate: Story = {
  render: () => <Progress />,
}

export const FullWidth: Story = {
  render: () => (
    <div className="w-full">
      <Progress value={80} />
    </div>
  ),
}
