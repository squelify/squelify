import type { Meta, StoryObj } from '@storybook/react'
import * as Lucide from 'lucide-react'
import { Button } from '../button/button'
import { Alert, AlertAction, AlertContent, AlertDescription, AlertIcon, AlertTitle } from './alert'
import type { AlertProps } from './alert'
import type { AlertVariants } from './alert.css'

const variantOptions: NonNullable<AlertVariants['variant']>[] = [
  'default',
  'info',
  'success',
  'warning',
  'error',
]

const defaultIcons = {
  default: <Lucide.Info />,
  info: <Lucide.Info />,
  success: <Lucide.CheckCircle />,
  warning: <Lucide.AlertTriangle />,
  error: <Lucide.AlertOctagon />,
}

const meta: Meta<AlertProps> = {
  title: 'Basic Components/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Alert component for displaying important messages or notifications.

## Example
\`\`\`tsx
import { Alert } from '#/components/base-ui'

// Basic usage
<Alert>
  <AlertIcon><Info /></AlertIcon>
  <AlertContent>
    <AlertTitle>Alert Title</AlertTitle>
    <AlertDescription>Alert description here.</AlertDescription>
  </AlertContent>
</Alert>

// With variant and action
<Alert variant="warning">
  <AlertIcon><AlertTriangle /></AlertIcon>
  <AlertContent>
    <AlertTitle>Warning</AlertTitle>
    <AlertDescription>Your session is about to expire.</AlertDescription>
  </AlertContent>
  <AlertAction>
    <Button size="sm">Extend Session</Button>
  </AlertAction>
</Alert>
\`\`\``,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: variantOptions,
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    controls: { include: ['variant'] },
  },
  render: (args) => (
    <div className="w-[600px]">
      <Alert {...args}>
        <AlertIcon>{defaultIcons[args.variant || 'default']}</AlertIcon>
        <AlertContent>
          <AlertTitle>Alert Title</AlertTitle>
          <AlertDescription>
            Alert description goes here. You can provide more detailed information about the alert.
          </AlertDescription>
        </AlertContent>
      </Alert>
    </div>
  ),
}

export const WithAction: Story = {
  parameters: {
    controls: { exclude: ['variant'] },
  },
  args: {
    variant: 'warning',
  },
  render: (args) => (
    <div className="w-[600px]">
      <Alert {...args}>
        <AlertIcon>{defaultIcons[args.variant || 'warning']}</AlertIcon>
        <AlertContent>
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Your session is about to expire. Please save your work and refresh the page.
          </AlertDescription>
        </AlertContent>
        <AlertAction>
          <Button size="sm">Refresh Now</Button>
        </AlertAction>
      </Alert>
    </div>
  ),
}

export const VariantShowcase: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <div className="flex w-[600px] flex-col gap-4">
      {variantOptions.map((variant) => (
        <Alert key={variant} variant={variant}>
          <AlertIcon>{defaultIcons[variant]}</AlertIcon>
          <AlertContent>
            <AlertTitle>{variant.charAt(0).toUpperCase() + variant.slice(1)} Alert</AlertTitle>
            <AlertDescription>
              This is a sample alert message. It can contain important information or notifications.
            </AlertDescription>
          </AlertContent>
        </Alert>
      ))}
    </div>
  ),
}

export const WithLongContent: Story = {
  parameters: {
    controls: { exclude: ['variant'] },
  },
  args: {
    variant: 'info',
  },
  render: (args) => (
    <div className="w-[600px]">
      <Alert {...args}>
        <AlertIcon>{defaultIcons[args.variant || 'info']}</AlertIcon>
        <AlertContent>
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            This alert contains a longer description that might span multiple lines. It demonstrates
            how the alert component handles longer content while maintaining its layout and
            readability. The content is properly wrapped and aligned.
          </AlertDescription>
        </AlertContent>
        <AlertAction>
          <Button size="sm">Learn More</Button>
        </AlertAction>
      </Alert>
    </div>
  ),
}
