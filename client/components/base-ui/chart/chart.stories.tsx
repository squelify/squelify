import type { Meta, StoryObj } from '@storybook/react'
import { Area, AreaChart, Bar, BarChart, Line, LineChart, Pie, PieChart } from 'recharts'
import { ChartContainer, ChartLegendContent, ChartTooltip, ChartTooltipContent } from './chart'

const DATA = [
  { id: 'jan', name: 'Jan', value: 100, sales: 80, revenue: 120 },
  { id: 'feb', name: 'Feb', value: 200, sales: 150, revenue: 180 },
  { id: 'mar', name: 'Mar', value: 150, sales: 120, revenue: 140 },
  { id: 'apr', name: 'Apr', value: 300, sales: 250, revenue: 280 },
  { id: 'may', name: 'May', value: 250, sales: 220, revenue: 260 },
]

const CHART_CONFIG = {
  value: {
    label: 'Value',
    theme: {
      light: '#0ea5e9',
      dark: '#38bdf8',
    },
  },
  sales: {
    label: 'Sales',
    theme: {
      light: '#8b5cf6',
      dark: '#a78bfa',
    },
  },
  revenue: {
    label: 'Revenue',
    theme: {
      light: '#10b981',
      dark: '#34d399',
    },
  },
}

const meta: Meta = {
  title: 'Basic Components/Chart',
  component: ChartContainer,
  parameters: {
    docs: {
      description: {
        component: `
Chart component built on top of Recharts with theme support.

## Example Usage
\`\`\`tsx
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '#/components/base-ui'
import { LineChart, Line } from 'recharts'

<ChartContainer config={chartConfig}>
  <LineChart data={data}>
    <Line dataKey="value" />
    <ChartTooltip content={<ChartTooltipContent />} />
  </LineChart>
</ChartContainer>
\`\`\``,
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const LineChartExample: Story = {
  render: () => (
    <ChartContainer config={CHART_CONFIG}>
      <LineChart data={DATA}>
        <Line type="monotone" dataKey="value" />
        <Line type="monotone" dataKey="sales" />
        <ChartTooltip content={<ChartTooltipContent />} />
      </LineChart>
    </ChartContainer>
  ),
}

export const AreaChartExample: Story = {
  render: () => (
    <ChartContainer config={CHART_CONFIG}>
      <AreaChart data={DATA}>
        <Area type="monotone" dataKey="value" stackId="1" />
        <Area type="monotone" dataKey="sales" stackId="1" />
        <ChartTooltip content={<ChartTooltipContent />} />
      </AreaChart>
    </ChartContainer>
  ),
}

export const BarChartExample: Story = {
  render: () => (
    <ChartContainer config={CHART_CONFIG}>
      <BarChart data={DATA}>
        <Bar dataKey="value" />
        <Bar dataKey="sales" />
        <ChartTooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  ),
}

const PIE_DATA = [
  { id: 'a', name: 'Group A', value: 400 },
  { id: 'b', name: 'Group B', value: 300 },
  { id: 'c', name: 'Group C', value: 300 },
  { id: 'd', name: 'Group D', value: 200 },
]

export const PieChartExample: Story = {
  render: () => (
    <ChartContainer config={CHART_CONFIG}>
      <PieChart>
        <Pie data={PIE_DATA} dataKey="value" nameKey="name" />
        <ChartTooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  ),
}

export const WithLegend: Story = {
  render: () => (
    <ChartContainer config={CHART_CONFIG}>
      <LineChart data={DATA}>
        <Line type="monotone" dataKey="value" />
        <Line type="monotone" dataKey="sales" />
        <Line type="monotone" dataKey="revenue" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegendContent />
      </LineChart>
    </ChartContainer>
  ),
}
