import { ExclamationTriangleIcon, InfoCircledIcon } from '@radix-ui/react-icons'
import type { Meta, StoryObj } from '@storybook/react'
import { Alert, AlertDescription, AlertTitle } from './alert'
import type { AlertVariants } from './alert.css'

const variantOptions: NonNullable<AlertVariants['variant']>[] = ['default', 'destructive']

const meta: Meta = {
  title: 'Basic Components/Alert',
  component: Alert,
  parameters: {
    docs: {
      description: {
        component: `
Alert component for displaying important messages or notifications.

## Example Usage
\`\`\`tsx
import { Alert, AlertTitle, AlertDescription } from '#/components/base-ui'

<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>You can add components to your app using the cli.</AlertDescription>
</Alert>
\`\`\``,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: variantOptions,
      description: 'Visual style variant',
      table: {
        type: { summary: 'AlertVariants["variant"]' },
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>You can add components to your app using the cli.</AlertDescription>
    </Alert>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <Alert>
      <InfoCircledIcon className="size-4" />
      <AlertTitle>Note</AlertTitle>
      <AlertDescription>This is an example of an alert with an icon.</AlertDescription>
    </Alert>
  ),
}

export const VariantShowcase: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Alert>
        <InfoCircledIcon className="size-4" />
        <AlertTitle>Default Alert</AlertTitle>
        <AlertDescription>This is a default alert - check it out!</AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <ExclamationTriangleIcon className="size-4" />
        <AlertTitle>Error Alert</AlertTitle>
        <AlertDescription>This is a destructive alert - be careful!</AlertDescription>
      </Alert>
    </div>
  ),
}

export const SimpleAlert: Story = {
  render: () => (
    <Alert>
      <AlertDescription>A simple alert without a title.</AlertDescription>
    </Alert>
  ),
}
