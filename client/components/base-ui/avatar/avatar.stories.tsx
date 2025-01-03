import type { Meta, StoryObj } from '@storybook/react'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import type { AvatarVariants } from './avatar.css'

const sizeOptions: NonNullable<AvatarVariants['size']>[] = ['default', 'sm', 'lg']

const meta: Meta = {
  title: 'Basic Components/Avatar',
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component: `
Avatar component for displaying user profile images with fallback support.

## Example Usage
\`\`\`tsx
import { Avatar, AvatarImage, AvatarFallback } from '#/components/base-ui'

<Avatar>
  <AvatarImage src="https://example.com/avatar.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
\`\`\``,
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: sizeOptions,
      description: 'Avatar size variant',
      table: {
        type: { summary: 'AvatarVariants["size"]' },
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://avatars.githubusercontent.com/u/921834?v=4" alt="@riipandi" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
}

export const SizeShowcase: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarImage src="https://avatars.githubusercontent.com/u/921834?v=4" alt="@riipandi" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>

      <Avatar>
        <AvatarImage src="https://avatars.githubusercontent.com/u/921834?v=4" alt="@riipandi" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>

      <Avatar size="lg">
        <AvatarImage src="https://avatars.githubusercontent.com/u/921834?v=4" alt="@riipandi" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </div>
  ),
}

export const WithFallback: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src="broken-link.jpg" alt="@johndoe" />
        <AvatarFallback>AR</AvatarFallback>
      </Avatar>

      <Avatar>
        <AvatarImage src="broken-link.jpg" alt="@janedoe" />
        <AvatarFallback>AR</AvatarFallback>
      </Avatar>

      <Avatar>
        <AvatarImage src="broken-link.jpg" alt="@robert" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    </div>
  ),
}

export const CustomFallback: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarFallback>👤</AvatarFallback>
      </Avatar>

      <Avatar>
        <AvatarFallback>🎨</AvatarFallback>
      </Avatar>

      <Avatar>
        <AvatarFallback className="bg-primary text-primary-foreground">VIP</AvatarFallback>
      </Avatar>
    </div>
  ),
}
