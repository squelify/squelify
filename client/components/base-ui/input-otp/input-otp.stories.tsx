import type { Meta, StoryObj } from '@storybook/react'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from './input-otp'
import type { InputOTPVariants } from './input-otp.css'

const sizeOptions: NonNullable<InputOTPVariants['size']>[] = ['default', 'sm', 'lg']

const meta: Meta = {
  title: 'Basic Components/InputOTP',
  component: InputOTP,
  parameters: {
    docs: {
      description: {
        component: `
One-Time Password input component with customizable slots.

## Example
\`\`\`tsx
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '#/components/base-ui'

<InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSeparator />
    <InputOTPSlot index={1} />
  </InputOTPGroup>
</InputOTP>
\`\`\``,
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: sizeOptions,
      description: 'Input size variant',
    },
    maxLength: {
      control: 'number',
      description: 'Maximum number of characters',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSeparator />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
}

export const WithSeparators: Story = {
  render: () => (
    <InputOTP maxLength={4}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSeparator />
        <InputOTPSlot index={1} />
        <InputOTPSeparator />
        <InputOTPSlot index={2} />
        <InputOTPSeparator />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>
  ),
}

export const SizeVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <InputOTP maxLength={4}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSeparator />
          <InputOTPSlot index={1} />
          <InputOTPSeparator />
          <InputOTPSlot index={2} />
          <InputOTPSeparator />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>

      <InputOTP maxLength={4}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSeparator />
          <InputOTPSlot index={1} />
          <InputOTPSeparator />
          <InputOTPSlot index={2} />
          <InputOTPSeparator />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>

      <InputOTP maxLength={4}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSeparator />
          <InputOTPSlot index={1} />
          <InputOTPSeparator />
          <InputOTPSlot index={2} />
          <InputOTPSeparator />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  ),
}

export const Pattern: Story = {
  render: () => (
    <InputOTP maxLength={6} pattern="\d*">
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSeparator />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
}
