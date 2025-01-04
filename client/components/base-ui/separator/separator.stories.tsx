import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from './separator'
import type { SeparatorVariants } from './separator.css'

const orientationOptions: NonNullable<SeparatorVariants['orientation']>[] = [
  'horizontal',
  'vertical',
]

const meta: Meta = {
  title: 'Basic Components/Separator',
  component: Separator,
  parameters: {
    docs: {
      description: {
        component: `
Separator component for visual separation of content.

## Example
\`\`\`tsx
import { Separator } from '#/components/base-ui'

<Separator />
<Separator orientation="vertical" />
\`\`\``,
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: orientationOptions,
      description: 'Separator orientation',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div>
      <div className="space-y-1">
        <h4 className="font-medium text-sm leading-none">Radix UI</h4>
        <p className="text-muted-foreground text-sm">An open-source UI component library.</p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <div className="space-y-4">
      <div>Content Above</div>
      <Separator />
      <div>Content Below</div>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-8 items-center space-x-4">
      <div>Left</div>
      <Separator orientation="vertical" />
      <div>Right</div>
    </div>
  ),
}
