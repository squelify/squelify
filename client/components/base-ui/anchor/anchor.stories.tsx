import type { Meta, StoryObj } from '@storybook/react'
import { Anchor, type AnchorProps } from './anchor'
import type { AnchorVariants } from './anchor.css'

const sizeOptions: NonNullable<AnchorVariants['size']>[] = ['xs', 'sm', 'md', 'lg', 'xl']
const variantOptions: NonNullable<AnchorVariants['variant']>[] = [
  'default',
  'muted',
  'destructive',
  'success',
]

const meta: Meta<AnchorProps> = {
  title: 'Basic Components/Anchor',
  component: Anchor,
  parameters: {
    controls: {
      exclude: ['asChild'],
    },
    docs: {
      description: {
        component: `
Anchor component for creating hyperlinks with various styles and behaviors.

## Example
\`\`\`tsx
import { Anchor } from '#/components/base-ui'

// Basic usage
<Anchor href="/about">About Us</Anchor>

// With variant and size
<Anchor href="/delete" variant="destructive" size="lg">
  Delete Account
</Anchor>

// Open in new tab
<Anchor href="https://example.com" newTab>
  External Link
</Anchor>
\`\`\``,
      },
    },
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Link content',
      table: {
        type: { summary: 'ReactNode | string' },
      },
    },
    href: {
      control: 'text',
      description: 'URL the link points to',
      table: {
        type: { summary: 'string' },
      },
    },
    size: {
      control: { type: 'inline-radio' },
      options: sizeOptions,
      table: {
        type: { summary: 'AnchorVariants["size"]' },
      },
    },
    variant: {
      control: { type: 'radio' },
      options: variantOptions,
      table: {
        type: { summary: 'AnchorVariants["variant"]' },
      },
    },
    newTab: {
      control: 'boolean',
      description: 'Open link in new tab',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the link',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Click me',
    href: '#',
  },
}

export const SizeShowcase: Story = {
  parameters: {
    controls: { exclude: ['size'] },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <Anchor href="#" size="xs">
        Extra Small Link
      </Anchor>
      <Anchor href="#" size="sm">
        Small Link
      </Anchor>
      <Anchor href="#" size="md">
        Medium Link
      </Anchor>
      <Anchor href="#" size="lg">
        Large Link
      </Anchor>
      <Anchor href="#" size="xl">
        Extra Large Link
      </Anchor>
    </div>
  ),
}

export const VariantShowcase: Story = {
  parameters: {
    controls: { exclude: ['variant'] },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <Anchor href="#" variant="default">
        Default Link
      </Anchor>
      <Anchor href="#" variant="muted">
        Muted Link
      </Anchor>
      <Anchor href="#" variant="destructive">
        Destructive Link
      </Anchor>
      <Anchor href="#" variant="success">
        Success Link
      </Anchor>
    </div>
  ),
}

export const StateShowcase: Story = {
  parameters: {
    controls: { exclude: ['disabled', 'newTab'] },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <Anchor href="#">Normal Link</Anchor>
      <Anchor href="#" disabled>
        Disabled Link
      </Anchor>
      <Anchor href="#" newTab>
        Opens in New Tab
      </Anchor>
    </div>
  ),
}
