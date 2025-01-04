import type { Meta, StoryObj } from '@storybook/react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './resizable'
import type { ResizableVariants } from './resizable.css'

const directionOptions: NonNullable<ResizableVariants['direction']>[] = ['horizontal', 'vertical']

const meta: Meta = {
  title: 'Basic Components/Resizable',
  component: ResizablePanelGroup,
  parameters: {
    docs: {
      description: {
        component: `
Resizable panel component for creating adjustable layouts.

## Example
\`\`\`tsx
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '#/components/base-ui'

<ResizablePanelGroup direction="horizontal">
  <ResizablePanel>Left panel</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel>Right panel</ResizablePanel>
</ResizablePanelGroup>
\`\`\``,
      },
    },
  },
  argTypes: {
    direction: {
      control: 'inline-radio',
      options: directionOptions,
      description: 'Panel layout direction',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[200px] max-w-md rounded-lg border"
    >
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Left panel</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Right panel</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}

export const Vertical: Story = {
  render: () => (
    <ResizablePanelGroup direction="vertical" className="min-h-[400px] max-w-md rounded-lg border">
      <ResizablePanel defaultSize={25}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Top panel</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Bottom panel</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}

export const MultiPanel: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[200px] max-w-md rounded-lg border"
    >
      <ResizablePanel defaultSize={30}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Navigation</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={40}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Content</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={30}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Preview</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}
