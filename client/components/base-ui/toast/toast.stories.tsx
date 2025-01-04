import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../button/button'
import { Toaster, toast } from './toast'
import type { ToastVariants } from './toast.css'

const variantOptions: NonNullable<ToastVariants['variant']>[] = ['default', 'success', 'error']

const meta: Meta = {
  title: 'Basic Components/Toast',
  component: Toaster,
  parameters: {
    docs: {
      description: {
        component: `
Toast component for displaying temporary notifications.

## Example
\`\`\`tsx
import { toast, Toaster } from '#/components/base-ui'

// Add Toaster to your app
<Toaster />

// Trigger toast
toast('Event has been created')
toast.success('Successfully saved!')
toast.error('Something went wrong')
\`\`\``,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: variantOptions,
      description: 'Toast variant',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <>
      <Button variant="outline" onClick={() => toast('Event has been created')}>
        Show Toast
      </Button>
      <Toaster />
    </>
  ),
}

export const Variants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="outline" onClick={() => toast('Default message')}>
        Default
      </Button>
      <Button variant="outline" onClick={() => toast.success('Successfully saved!')}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.error('Something went wrong')}>
        Error
      </Button>
      <Toaster />
    </div>
  ),
}

export const WithAction: Story = {
  render: () => (
    <>
      <Button
        variant="outline"
        onClick={() =>
          toast('Event scheduled', {
            action: {
              label: 'Undo',
              onClick: () => console.info('Undo'),
            },
          })
        }
      >
        With Action
      </Button>
      <Toaster />
    </>
  ),
}

export const WithDuration: Story = {
  render: () => (
    <>
      <Button
        variant="outline"
        onClick={() =>
          toast('This toast will stay for 5 seconds', {
            duration: 5000,
          })
        }
      >
        Custom Duration
      </Button>
      <Toaster />
    </>
  ),
}
