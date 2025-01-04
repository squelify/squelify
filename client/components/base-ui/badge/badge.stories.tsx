import type { Meta, StoryObj } from '@storybook/react'
import { Badge, type BadgeProps } from './badge'
import type { BadgeVariants } from './badge.css'

const variantOptions: NonNullable<BadgeVariants['variant']>[] = [
  'default',
  'secondary',
  'outline',
  'destructive',
  'success',
  'warning',
]

const sizeOptions: NonNullable<BadgeVariants['size']>[] = ['sm', 'md', 'lg']

const meta: Meta<BadgeProps> = {
  title: 'Basic Components/Badge',
  component: Badge,
  parameters: {
    controls: {
      exclude: ['asChild'],
    },
    docs: {
      description: {
        component: `
Badge component for displaying short status descriptors.

## Example
\`\`\`tsx
import { Badge } from '#/components/base-ui'

// Basic usage
<Badge>New</Badge>

// With variant
<Badge variant="success">Completed</Badge>

// With size
<Badge size="lg">Featured</Badge>
\`\`\``,
      },
    },
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Badge content',
    },
    variant: {
      control: { type: 'select' },
      options: variantOptions,
      table: {
        type: { summary: 'BadgeVariants["variant"]' },
      },
    },
    size: {
      control: { type: 'select' },
      options: sizeOptions,
      table: {
        type: { summary: 'BadgeVariants["size"]' },
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Badge',
  },
}

export const VariantShowcase: Story = {
  parameters: {
    controls: { exclude: ['variant'] },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
    </div>
  ),
}

export const SizeShowcase: Story = {
  parameters: {
    controls: { exclude: ['size'] },
  },
  render: () => (
    <div className="flex items-center gap-4">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
}
