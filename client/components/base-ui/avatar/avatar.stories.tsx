import type { Meta, StoryObj } from '@storybook/react'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import type { AvatarVariants } from './avatar.css'

const sizeOptions: NonNullable<AvatarVariants['size']>[] = ['xs', 'sm', 'md', 'lg', 'xl']

const meta: Meta<typeof Avatar> = {
  title: 'Basic Components/Avatar',
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component: `
Avatar component built with Ark UI for user profile images with fallback support.

## Example
\`\`\`tsx
import { Avatar, AvatarImage, AvatarFallback } from '#/components/base-ui'

// Basic usage
<Avatar>
  <AvatarImage src="/path/to/image.jpg" alt="User Name" />
  <AvatarFallback>UN</AvatarFallback>
</Avatar>

// With size
<Avatar size="lg">
  <AvatarImage src="/path/to/image.jpg" alt="User Name" />
  <AvatarFallback>UN</AvatarFallback>
</Avatar>
\`\`\``,
      },
    },
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: sizeOptions,
    },
  },
}

export default meta
type Story = StoryObj<typeof Avatar>

export const Default: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://avatars.githubusercontent.com/u/921834?v=4" alt="John Doe" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
}

export const WithFallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="/broken-image.jpg" alt="John Doe" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
}

export const SizeShowcase: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {sizeOptions.map((size) => (
        <Avatar key={size} size={size}>
          <AvatarImage
            src="https://avatars.githubusercontent.com/u/921834?v=4"
            alt={`${size} size`}
          />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
}
