import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { Separator } from '../separator/separator'
import { ScrollArea } from './scroll-area'
import type { ScrollAreaVariants } from './scroll-area.css'

const sizeOptions: NonNullable<ScrollAreaVariants['size']>[] = ['default', 'sm', 'lg']

const meta: Meta = {
  title: 'Basic Components/ScrollArea',
  component: ScrollArea,
  parameters: {
    docs: {
      description: {
        component: `
ScrollArea component with custom scrollbar styling.

## Example
\`\`\`tsx
import { ScrollArea } from '#/components/base-ui'

<ScrollArea className="h-[200px]">
  <div>Scrollable content</div>
</ScrollArea>
\`\`\``,
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: sizeOptions,
      description: 'Scrollbar size',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const tags = Array.from({ length: 50 }).map((_, i, a) => `v1.2.0-beta.${a.length - i}`)

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 font-medium text-sm leading-none">Tags</h4>
        {tags.map((tag, _) => (
          <React.Fragment key={tag}>
            <div className="text-sm">{tag}</div>
            <Separator className="my-2" />
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4">
      <ScrollArea className="h-72 w-48 rounded-md border" size="sm">
        <div className="p-4">
          <h4 className="mb-4 font-medium text-sm">Small Scrollbar</h4>
          {tags.slice(0, 20).map((tag) => (
            <div key={tag} className="text-sm">
              {tag}
            </div>
          ))}
        </div>
      </ScrollArea>

      <ScrollArea className="h-72 w-48 rounded-md border">
        <div className="p-4">
          <h4 className="mb-4 font-medium text-sm">Default Scrollbar</h4>
          {tags.slice(0, 20).map((tag) => (
            <div key={tag} className="text-sm">
              {tag}
            </div>
          ))}
        </div>
      </ScrollArea>

      <ScrollArea className="h-72 w-48 rounded-md border" size="lg">
        <div className="p-4">
          <h4 className="mb-4 font-medium text-sm">Large Scrollbar</h4>
          {tags.slice(0, 20).map((tag) => (
            <div key={tag} className="text-sm">
              {tag}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  ),
}
