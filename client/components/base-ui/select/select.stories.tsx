import type { Meta, StoryObj } from '@storybook/react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './select'
import type { SelectVariants } from './select.css'

const sizeOptions: NonNullable<SelectVariants['size']>[] = ['default', 'sm', 'lg']

const meta: Meta = {
  title: 'Basic Components/Select',
  component: Select,
  parameters: {
    docs: {
      description: {
        component: `
Select component for choosing a value from a list of options.

## Example
\`\`\`tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '#/components/base-ui'

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
\`\`\``,
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: sizeOptions,
      description: 'Select size variant',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
          <SelectItem value="grape">Grape</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Select>
        <SelectTrigger className="w-[180px]" size="sm">
          <SelectValue placeholder="Small" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sm">Small Select</SelectItem>
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Default" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default Select</SelectItem>
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="w-[180px]" size="lg">
          <SelectValue placeholder="Large" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="lg">Large Select</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const Grouped: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a timezone" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>North America</SelectLabel>
          <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
          <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
          <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Europe</SelectLabel>
          <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
          <SelectItem value="cet">Central European Time (CET)</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Asia</SelectLabel>
          <SelectItem value="jst">Japan Standard Time (JST)</SelectItem>
          <SelectItem value="cst_china">China Standard Time (CST)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Disabled" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="disabled">Disabled Option</SelectItem>
      </SelectContent>
    </Select>
  ),
}
