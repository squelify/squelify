import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import * as Lucide from 'lucide-react'
import { Link, type LinkProps } from './link'
import type { LinkVariants } from './link.css'

const variantOptions: NonNullable<LinkVariants['variant']>[] = ['default', 'muted', 'nav', 'ghost']

const sizeOptions: NonNullable<LinkVariants['size']>[] = ['sm', 'default', 'lg']

const meta: Meta<LinkProps> = {
  title: 'Basic Components/Link',
  component: Link,
  tags: [],
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
        type: { summary: 'LinkVariants["variant"]' },
      },
    },
    size: {
      control: { type: 'inline-radio' },
      options: sizeOptions,
      table: {
        type: { summary: 'LinkVariants["size"]' },
      },
    },
    newTab: {
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
      },
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

export const Default: Story = {
  parameters: {
    controls: { exclude: ['asChild'] },
  },
  args: {
    children: 'Click here',
    href: 'https://example.com',
    newTab: true,
  },
}

export const VariantShowcase: Story = {
  parameters: {
    controls: { exclude: ['variant', 'children', 'asChild'] },
  },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Link {...args} href="#" variant="default">
        Default Link
      </Link>
      <Link {...args} href="#" variant="muted">
        Muted Link
      </Link>
      <Link {...args} href="#" variant="nav">
        Navigation Link
      </Link>
      <Link {...args} href="#" variant="ghost">
        Ghost Link
      </Link>
    </div>
  ),
}

export const SizeShowcase: Story = {
  parameters: {
    controls: { exclude: ['size', 'children', 'asChild'] },
  },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Link {...args} href="#" size="sm">
        Small Link
      </Link>
      <Link {...args} href="#" size="default">
        Default Size Link
      </Link>
      <Link {...args} href="#" size="lg">
        Large Link
      </Link>
    </div>
  ),
}

export const WithIconShowcase: Story = {
  parameters: {
    controls: { exclude: ['children', 'asChild'] },
  },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Link {...args} href="https://example.com" newTab>
        External Website
      </Link>
      <Link {...args} href="#" variant="nav">
        <Lucide.Settings className="size-4" />
        Settings
      </Link>
      <Link {...args} href="#" variant="ghost">
        <Lucide.Mail className="size-4" />
        Contact Us
      </Link>
    </div>
  ),
}
