import type { Meta, StoryObj } from '@storybook/react'
import { PlusCircle } from 'lucide-react'
import { Button } from '../button/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'
import type { TooltipVariants } from './tooltip.css'

const sizeOptions: NonNullable<TooltipVariants['size']>[] = ['default', 'sm', 'lg']

const meta: Meta = {
  title: 'Basic Components/Tooltip',
  component: Tooltip,
  parameters: {
    docs: {
      description: {
        component: `
Tooltip component for displaying additional information on hover.

## Example Usage
\`\`\`tsx
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '#/components/base-ui'

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>Tooltip content</TooltipContent>
  </Tooltip>
</TooltipProvider>
\`\`\``,
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: sizeOptions,
      description: 'Tooltip size',
    },
  },
  decorators: [(Story) => <TooltipProvider>{Story()}</TooltipProvider>],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>Add to library</TooltipContent>
    </Tooltip>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon">
          <PlusCircle className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Add new item</TooltipContent>
    </Tooltip>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Small</Button>
        </TooltipTrigger>
        <TooltipContent size="sm">Small tooltip</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Default</Button>
        </TooltipTrigger>
        <TooltipContent>Default tooltip</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Large</Button>
        </TooltipTrigger>
        <TooltipContent size="lg">Large tooltip with more content</TooltipContent>
      </Tooltip>
    </div>
  ),
}
