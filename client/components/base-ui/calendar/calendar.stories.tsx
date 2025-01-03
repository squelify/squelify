import type { Meta, StoryObj } from '@storybook/react'
import { addDays } from 'date-fns'
import { Calendar } from './calendar'

const meta: Meta = {
  title: 'Basic Components/Calendar',
  component: Calendar,
  parameters: {
    docs: {
      description: {
        component: `
Calendar component for date selection and display.

## Example Usage
\`\`\`tsx
import { Calendar } from '#/components/base-ui'

const [date, setDate] = useState<Date>()

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
/>
\`\`\``,
      },
    },
  },
  argTypes: {
    mode: {
      control: 'inline-radio',
      options: ['single', 'multiple', 'range'],
      description: 'Selection mode',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable calendar',
    },
    selected: {
      control: 'date',
      description: 'Selected date(s)',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Calendar mode="single" className="rounded-md border" />,
}

export const Selected: Story = {
  render: () => <Calendar mode="single" selected={new Date()} className="rounded-md border" />,
}

export const MultipleSelection: Story = {
  render: () => (
    <Calendar
      mode="multiple"
      selected={[new Date(), addDays(new Date(), 2), addDays(new Date(), 5)]}
      className="rounded-md border"
    />
  ),
}

export const RangeSelection: Story = {
  render: () => (
    <Calendar
      mode="range"
      selected={{
        from: new Date(),
        to: addDays(new Date(), 7),
      }}
      className="rounded-md border"
    />
  ),
}

export const DisabledDates: Story = {
  render: () => (
    <Calendar
      mode="single"
      disabled={(date) => date < new Date() || date > addDays(new Date(), 7)}
      className="rounded-md border"
    />
  ),
}

export const WithFooter: Story = {
  render: () => (
    <div className="space-y-4">
      <Calendar mode="single" className="rounded-md border" />
      <div className="rounded-md border p-4 text-sm">Selected date will appear here</div>
    </div>
  ),
}
