import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import * as Lucide from 'lucide-react'
import { Button, type ButtonProps } from './button'
import type { ButtonVariants } from './button.css'

const variantOptions: NonNullable<ButtonVariants['variant']>[] = [
  'default',
  'primary',
  'secondary',
  'subtle',
  'destructive',
  'success',
  'warning',
  'outline',
  'ghost',
  'link',
  'gradient',
]

const sizeOptions: NonNullable<ButtonVariants['size']>[] = [
  'xs',
  'sm',
  'default',
  'lg',
  'xl',
  'icon',
]

const meta: Meta<ButtonProps> = {
  title: 'Basic Components/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: `
Button component provides clickable elements with various styles and states.

## Example Usage
\`\`\`tsx
import { Button } from '#/components/base-ui'

// Basic usage
<Button>Click me</Button>

// With loading state
<Button isLoading>Processing</Button>

// With loading text
<Button isLoading>Save Changes</Button>

// With icon
<Button>
  <Search />
  Search
</Button>
\`\`\``,
      },
    },
  },
  argTypes: {
    children: {
      control: 'text',
      table: {
        type: { summary: 'ReactNode | string' },
      },
    },
    variant: {
      control: { type: 'radio' },
      options: variantOptions,
      table: {
        defaultValue: { summary: 'default' },
        type: { summary: 'ButtonVariants["variant"]' },
      },
    },
    size: {
      control: { type: 'inline-radio' },
      options: sizeOptions,
      table: {
        type: { summary: 'ButtonVariants["size"]' },
      },
    },
    isLoading: {
      control: 'boolean',
    },
    asChild: {
      control: 'boolean',
      description: 'Render as child element',
      table: {
        type: { summary: 'boolean' },
      },
    },
  },
  args: { onClick: fn() },
}

export default meta
type Story = StoryObj<typeof meta>

// Individual Stories for Controls
export const Default: Story = {
  parameters: {
    controls: { exclude: ['asChild'] },
  },
  args: { children: 'Button' },
}

export const LoadingIndicator: Story = {
  parameters: {
    controls: { exclude: ['asChild'] },
  },
  args: { children: 'Loading', isLoading: true },
}

export const LoadingWithText: Story = {
  parameters: {
    controls: { exclude: ['asChild'] },
  },
  args: { children: 'Save Changes', isLoading: true },
}

// Showcases with Focused Controls
export const VariantShowcase: Story = {
  parameters: {
    controls: { exclude: ['variant', 'children', 'asChild'] },
  },
  args: {
    size: 'default',
    isLoading: false,
    disabled: false,
  },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Button {...args}>Default</Button>
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="subtle">
        Subtle
      </Button>
      <Button {...args} variant="destructive">
        Destructive
      </Button>
      <Button {...args} variant="success">
        Success
      </Button>
      <Button {...args} variant="warning">
        Warning
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="link">
        Link
      </Button>
      <Button {...args} variant="gradient">
        Gradient
      </Button>
    </div>
  ),
}

export const SizeShowcase: Story = {
  parameters: {
    controls: { exclude: ['size', 'children', 'asChild'] },
  },
  args: {
    variant: 'default',
    isLoading: false,
    disabled: false,
  },
  render: (args) => (
    <div className="flex flex-wrap items-end gap-4">
      <Button {...args} size="xs">
        Extra Small
      </Button>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args}>Default</Button>
      <Button {...args} size="lg">
        Large
      </Button>
      <Button {...args} size="xl">
        Extra Large
      </Button>
      <Button {...args} size="icon">
        <Lucide.Plus />
      </Button>
    </div>
  ),
}

export const IconShowcase: Story = {
  parameters: {
    controls: { exclude: ['children', 'asChild', 'variant'] },
  },
  args: {
    size: 'default',
    isLoading: false,
    disabled: false,
  },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Button {...args}>
        <Lucide.Search className="-ml-0.5" />
        Search
      </Button>
      <Button {...args} variant="success">
        <Lucide.Mail className="-ml-0.5" />
        Email
      </Button>
      <Button {...args} variant="outline">
        <Lucide.Github className="-ml-0.5" />
        Github
      </Button>
      <Button {...args} size="icon" variant="ghost">
        <Lucide.Bell className="-ml-0.5" />
      </Button>
    </div>
  ),
}

export const StateShowcase: Story = {
  parameters: {
    controls: { exclude: ['children', 'asChild'] },
  },
  args: {
    variant: 'default',
    size: 'default',
  },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Button {...args} isLoading>
        Loading
      </Button>
      <Button {...args} isLoading>
        Submit
      </Button>
      <Button {...args} disabled>
        Disabled
      </Button>
      <Button {...args} variant="outline" disabled>
        Disabled Outline
      </Button>
    </div>
  ),
}
