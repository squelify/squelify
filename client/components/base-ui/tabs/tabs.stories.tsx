import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../button/button'
import { Input } from '../input/input'
import { Label } from '../label/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import type { TabsVariants } from './tabs.css'

const sizeOptions: NonNullable<TabsVariants['size']>[] = ['default', 'sm', 'lg']

const meta: Meta = {
  title: 'Basic Components/Tabs',
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component: `
Tabs component for switching between different views.

## Example Usage
\`\`\`tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '#/components/base-ui'

<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account settings</TabsContent>
</Tabs>
\`\`\``,
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: sizeOptions,
      description: 'Tabs size',
    },
    defaultValue: {
      control: 'text',
      description: 'Default selected tab',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" />
          </div>
          <Button>Save changes</Button>
        </div>
      </TabsContent>
      <TabsContent value="password">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current">Current password</Label>
            <Input id="current" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">New password</Label>
            <Input id="new" type="password" />
          </div>
          <Button>Change password</Button>
        </div>
      </TabsContent>
    </Tabs>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Small Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Small Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Small tab content 1</TabsContent>
        <TabsContent value="tab2">Small tab content 2</TabsContent>
      </Tabs>

      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Default Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Default Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Default tab content 1</TabsContent>
        <TabsContent value="tab2">Default tab content 2</TabsContent>
      </Tabs>

      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Large Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Large Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Large tab content 1</TabsContent>
        <TabsContent value="tab2">Large tab content 2</TabsContent>
      </Tabs>
    </div>
  ),
}
