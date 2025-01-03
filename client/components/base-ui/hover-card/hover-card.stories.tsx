import type { Meta, StoryObj } from '@storybook/react'
import { CalendarDays } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../avatar/avatar'
import { Button } from '../button/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card'

const meta: Meta = {
  title: 'Basic Components/HoverCard',
  component: HoverCard,
  parameters: {
    docs: {
      description: {
        component: `
HoverCard component for displaying floating content when hovering over a trigger element.

## Example Usage
\`\`\`tsx
import { HoverCard, HoverCardTrigger, HoverCardContent } from '#/components/base-ui'

<HoverCard>
  <HoverCardTrigger>Hover me</HoverCardTrigger>
  <HoverCardContent>Content</HoverCardContent>
</HoverCard>
\`\`\``,
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@nextjs</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage src="https://github.com/vercel.png" />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">@nextjs</h4>
            <p className="text-sm">The React Framework – created and maintained by @vercel.</p>
            <div className="flex items-center pt-2">
              <CalendarDays className="mr-2 size-4 opacity-70" />{' '}
              <span className="text-muted-foreground text-xs">Joined December 2021</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
}

export const SimpleContent: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">Hover for info</Button>
      </HoverCardTrigger>
      <HoverCardContent>Simple hover card content</HoverCardContent>
    </HoverCard>
  ),
}

export const WithDelay: Story = {
  render: () => (
    <HoverCard openDelay={200} closeDelay={300}>
      <HoverCardTrigger asChild>
        <Button variant="link">Hover with delay</Button>
      </HoverCardTrigger>
      <HoverCardContent>Content with open/close delay</HoverCardContent>
    </HoverCard>
  ),
}
