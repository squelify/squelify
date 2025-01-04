import type { Meta, StoryObj } from '@storybook/react'
import { AspectRatio } from './aspect-ratio'

const meta: Meta = {
  title: 'Basic Components/AspectRatio',
  component: AspectRatio,
  parameters: {
    docs: {
      description: {
        component: `
AspectRatio component for maintaining consistent width/height ratios for content.

## Example
\`\`\`tsx
import { AspectRatio } from '#/components/base-ui'

<AspectRatio ratio={16/9}>
  <img src="..." alt="..." />
</AspectRatio>
\`\`\``,
      },
    },
  },
  argTypes: {
    ratio: {
      control: 'number',
      description: 'Width to height ratio',
      table: {
        type: { summary: 'number' },
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <AspectRatio ratio={16 / 9} className="debug bg-muted">
      <div className="flex h-full items-center justify-center">16:9 Aspect Ratio</div>
    </AspectRatio>
  ),
}

export const RatioShowcase: Story = {
  render: () => (
    <div className="flex w-full flex-col gap-8">
      <div>
        <p className="mb-2 text-muted-foreground text-sm">Square (1:1)</p>
        <AspectRatio ratio={1 / 1} className="debug bg-muted">
          <div className="flex h-full items-center justify-center">1:1</div>
        </AspectRatio>
      </div>

      <div>
        <p className="mb-2 text-muted-foreground text-sm">Landscape (16:9)</p>
        <AspectRatio ratio={16 / 9} className="debug bg-muted">
          <div className="flex h-full items-center justify-center">16:9</div>
        </AspectRatio>
      </div>

      <div>
        <p className="mb-2 text-muted-foreground text-sm">Portrait (9:16)</p>
        <AspectRatio ratio={9 / 16} className="debug w-[200px] bg-muted">
          <div className="flex h-full items-center justify-center">9:16</div>
        </AspectRatio>
      </div>
    </div>
  ),
}

export const WithImage: Story = {
  render: () => (
    <AspectRatio ratio={16 / 9} className="debug">
      <img
        src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
        alt="Pict by Drew Beamer"
        className="object-cover"
      />
    </AspectRatio>
  ),
}

export const WithVideo: Story = {
  render: () => (
    <AspectRatio ratio={16 / 9}>
      <iframe
        src="https://yootheme.com/site/images/media/yootheme-pro.mp4"
        title="YouTube video"
        allowFullScreen
        className="h-full w-full"
      />
    </AspectRatio>
  ),
}
