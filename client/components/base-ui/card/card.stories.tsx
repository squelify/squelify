import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '#/components/base-ui'
import { Card, CardContent, CardDescription } from '#/components/base-ui'
import { CardFooter, CardHeader, CardTitle } from '#/components/base-ui'
import type { CardVariants } from './card.css'

const variantOptions: NonNullable<CardVariants['variant']>[] = ['default', 'secondary']

const meta: Meta<typeof Card> = {
  title: 'Basic Components/Card',
  component: Card,
  parameters: {
    controls: {
      exclude: ['asChild'],
    },
    docs: {
      description: {
        component: `
Card component for displaying content in a contained format.

## Example Usage
\`\`\`tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '#/components/base-ui'

<Card variant="default">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
\`\`\``,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: variantOptions,
      description: 'Card style variant',
      table: {
        type: { summary: 'CardVariants["variant"]' },
        defaultValue: { summary: 'default' },
      },
    },
    compact: {
      control: 'boolean',
      description: 'Use compact padding',
      table: {
        type: { summary: 'boolean' },
      },
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    asChild: {
      control: 'boolean',
      description: 'Render as child element',
      table: {
        type: { summary: 'boolean' },
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Card>

// Individual Stories for Controls
export const Default: Story = {
  parameters: {
    controls: { exclude: ['asChild'] },
  },
  args: {
    variant: 'default',
    compact: false,
    className: 'w-[350px]',
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Manage your account preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Update your account settings here. Changes will be reflected immediately.</p>
      </CardContent>
      <CardFooter>
        <Button variant="subtle">Cancel</Button>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  ),
}

// Showcases with Focused Controls
export const VariantShowcase: Story = {
  parameters: {
    controls: { exclude: ['variant', 'className', 'asChild'] },
  },
  args: {
    compact: false,
  },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Card className="w-[350px]" {...args}>
        <CardHeader>
          <CardTitle>Default Variant</CardTitle>
          <CardDescription>Standard card layout</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for default variant</p>
        </CardContent>
        <CardFooter>
          <Button variant="subtle">Cancel</Button>
          <Button>Action</Button>
        </CardFooter>
      </Card>

      <Card className="w-[350px]" variant="secondary" {...args}>
        <CardHeader>
          <CardTitle>Secondary Variant</CardTitle>
          <CardDescription>Alternative card style</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for secondary variant</p>
        </CardContent>
        <CardFooter>
          <Button variant="subtle">Cancel</Button>
          <Button variant="primary">Action</Button>
        </CardFooter>
      </Card>
    </div>
  ),
}

export const CompactShowcase: Story = {
  parameters: {
    controls: { exclude: ['compact', 'className', 'asChild'] },
  },
  args: {
    variant: 'default',
  },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Card className="w-[350px]" {...args}>
        <CardHeader>
          <CardTitle>Regular Padding</CardTitle>
          <CardDescription>Default spacing</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Standard content area</p>
        </CardContent>
        <CardFooter>
          <Button>Action</Button>
        </CardFooter>
      </Card>

      <Card className="w-[350px]" compact {...args}>
        <CardHeader>
          <CardTitle>Compact Layout</CardTitle>
          <CardDescription>With reduced padding</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Compact content area</p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Action</Button>
        </CardFooter>
      </Card>
    </div>
  ),
}
