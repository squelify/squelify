import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './badge'
import type { BadgeVariants } from './badge.css'

const variantOptions: NonNullable<BadgeVariants['variant']>[] = [
  'default',
  'secondary',
  'success',
  'info',
  'warning',
  'destructive',
  'outline',
  'ghost',
]

const sizeOptions: NonNullable<BadgeVariants['size']>[] = ['sm', 'default', 'lg']
const roundedOptions: NonNullable<BadgeVariants['rounded']>[] = ['default', 'full']

const meta: Meta = {
  title: 'Basic Components/Badge',
  component: Badge,
  parameters: {
    docs: {
      description: {
        component: `
Badge component for displaying status, labels, or counts.

## Example Usage
\`\`\`tsx
import { Badge } from '#/components/base-ui'

<Badge>New</Badge>
<Badge variant="success">Completed</Badge>
<Badge variant="destructive">Error</Badge>
\`\`\``,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: variantOptions,
      description: 'Visual style variant',
    },
    size: {
      control: 'inline-radio',
      options: sizeOptions,
      description: 'Badge size',
    },
    rounded: {
      control: 'inline-radio',
      options: roundedOptions,
      description: 'Border radius style',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Badge>Badge</Badge>,
}

export const VariantShowcase: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
    </div>
  ),
}

export const SizeShowcase: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Badge size="sm">Small</Badge>
      <Badge size="default">Default</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
}

export const RoundedShowcase: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Badge rounded="default">Default Rounded</Badge>
      <Badge rounded="full">Fully Rounded</Badge>
    </div>
  ),
}

export const CombinedVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="success" size="lg" rounded="full">
        Complete
      </Badge>
      <Badge variant="destructive" size="sm">
        Error
      </Badge>
      <Badge variant="outline" size="lg">
        Draft
      </Badge>
      <Badge variant="secondary" rounded="full">
        Pending
      </Badge>
    </div>
  ),
}
